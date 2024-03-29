import cron from "node-cron"
import { Router } from "express"

import { User } from "@/data/database"
import { createTokenSet, refreshAccessToken, verifyAccessToken } from "@/auth/token"
import { generateRandomString, hashPassword, checkPassword } from "@/auth/hash"
import { AccountLogger } from "@/helper/logger"
import { checkForPermission, extractPermissions, encodePermissions } from "@/auth/perms"
import { getUserEmailInfo, resendVerificationEmail, updateUserEmail } from "@/auth/email"

var authData = { 
  passwords: []
}

const tickPasswordExpiration = () => {
  authData.passwords.forEach((pwData, i) => {
    authData.passwords[i].timeToExpiration--;

    if(authData.passwords[i].timeToExpiration <= 0) {
      authData.passwords.splice(i, 1)

      AccountLogger.info(`Password under id ${i} has expired!`);
    }
  })
}

cron.schedule('* * * * *', () => tickPasswordExpiration())

const startAccountProcess = async (req, res, next) => {
  var newPassword = generateRandomString(15)

  hashPassword(newPassword, hashedPW => {
    authData.passwords.push({ password: hashedPW, timeToExpiration: 600 })
  })

  AccountLogger.info(`Your password to start the account process is: ${newPassword}`);

  res.status(200).send({ message: "Account request process has been started!" });
}

const createAccount = async (req, res, next) => {
  const { register_password, display_name, username, password } = req.body

  if(!register_password) {
    res.status(400).send({ message: "No account registration has been provided!" })
    return
  }

  if(!display_name || !username || !password) {
    res.status(400).send({ message: "Not all required account fields are provided!" })
    return
  }

  var passwordId = await new Promise(async (resolve, reject) => {
    if(authData.passwords.length === 0) resolve(-1)

    authData.passwords.forEach(async (pwData, i) => {
      var passwordVerified = await new Promise((resolve, reject) => {
        checkPassword(register_password, pwData.password, isCorrect => {
          resolve(isCorrect)
        })
      })
  
      if(passwordVerified) {
        resolve(i)
      }

      if(i === authData.passwords.length-1) resolve(-1)
    })
  })

  if(passwordId > -1) {
    const users = await User.findAll({ where: { username } })

    if(users.length > 0) {
      res.status(400).send({ message: `A user with that username already exists!` })
      return
    }

    try {
      hashPassword(password, async encrypted_password => {
        try {
          const user = await User.create({ username, password: encrypted_password, displayName: display_name })
        } catch(e) {
          res.status(400).send({ message: "Unable to create an account for that user!", error: e })
          return
        }

        authData.passwords.splice(passwordId, 1)
    
        AccountLogger.info(`User created an account with password ${passwordId}`)
    
        res.status(201).send({ message: `Created account for ${username}!` })
      })
    } catch(e) {
      res.status(500).send({ message: "An error occurred when creating the account!" })
      AccountLogger.error(e)
    }
  } else
    res.status(400).send({ message: "Unable to verify the password provided!" })
}

const loginAccount = async (req, res, next) => {
  const { username, password } = req.body

  if(!username || !password) {
    res.status(400).send({ message: "Not all required fields are provided!" })
    return
  }

  const user = await User.findOne({ where: { username } })

  if(!user) {
    res.status(400).send({ message: "There is no user with that username provided!" })
    return
  }

  if(!user.uuid) {
    await user.update({ uuid: require('uuid').v4() })
  }

  try {
    checkPassword(password, user.password, isCorrect => {
      if(!isCorrect) {
        res.status(400).send({ message: "The password the user provided is not correct!" })
        return
      }

      const tokens = createTokenSet(user.uuid)
      
      res.status(200).send({ tokens: { ...tokens }, user: { username: user.username, display_name: user.displayName, email: user.email } })
    })
  } catch(e) {
    res.status(500).send({ message: "An error occurred when checking the password provided!" })
    AccountLogger.error(e)
  }
}

const verifyAccount = async (req, res, next) => {
  const authHeader = req.header('Authorization')

  if(!authHeader) {
    res.status(401).send({ message: "No access token was provided!" })
    return
  }

  const accessToken = authHeader.split(' ')[1]

  try {
    const userId = verifyAccessToken(accessToken)

    const user = await User.findOne({ where: { uuid: userId } })

    if(!user) {
      res.status(401).send({ message: "The user provided with the token could not be found!" })
      return
    }

    req.user = {
      username: user.username,
      id: user.id,
      uuid: user.uuid,
      email: user.email ? user.email : undefined,
      permissions: user.permissionLevel
    }

    next()
  } catch(e) {
    res.status(401).send({ message: e.message })
    AccountLogger.error(e)
    return
  }
}

const verifyPermission = async (perm, req, res, next) => {
  if(checkForPermission(req.user.permissions, "administrator") || checkForPermission(req.user.permissions, perm))
    next()
  else
    res.status(401).send({ message: "You do not have the appropriate permissions to handle this command. Inquire with an administrator about accessing this permission!" })
}

const getPermissions = async (req, res, next) => {
  const perms = extractPermissions(req.user.permissions)

  res.status(200).send({ perms })
}

const performAccessTokenRefresh = async (req, res, next) => {
  const { refresh_token } = req.body

  try {
    const access_token = refreshAccessToken(refresh_token)

    res.status(201).send({ access_token })
  } catch(e) {
    res.status(401).send({ message: e.message })
    AccountLogger.error(e)
    return
  }
}

const updatePassword = async (req, res, next) => {
  const { old_password, new_password } = req.body
  const { id } = req.user

  const user = await User.findOne({ where: { id } })

  if(!user) {
    res.status(400).send({ message: "There is no user with that username provided!" })
    return
  }

  try {
    checkPassword(old_password, user.password, isCorrect => {
      if(!isCorrect) {
        res.status(400).send({ message: "The password the user provided is not correct!" })
        return
      }
      
      hashPassword(new_password, async encrypted_password => {
        try {
          User.update({ password: encrypted_password }, { where: { id } })
        } catch(e) {
          res.status(400).send({ message: "Unable to update the password for that user!", error: e })
          return
        }
    
        res.status(200).send({ message: `Updated password for ${user.username}!` })
      })
    })
  } catch(e) {
    res.status(500).send({ message: "An error occurred when checking the password provided!" })
    AccountLogger.error(e)
  }
}

const emailInfo = async (req, res, next) => {
  const { uuid } = req.user

  try {
    const data = await getUserEmailInfo(uuid)

    res.status(200).send({ ...data })
  } catch(e) {
    res.status(500).send({ message: "An error occurred when checking the password provided!" })
    AccountLogger.error(e)
  }
}

const updateEmail = async (req, res, next) => {
  const { email } = req.body
  const { uuid } = req.user

  try {
    const data = await updateUserEmail(uuid, email)
    
    res.status(200).send({ ...data, message: "Updated email for user. Verification email has been sent to that address." })
  } catch(e) {
    res.status(500).send({ message: "An error occurred when checking the password provided!" })
    AccountLogger.error(e)
  }
}

const resendVerification = async (req, res, next) => {
  const { uuid } = req.user

  try {
    await resendVerificationEmail(uuid)

    res.status(200).send({ message: "Resent verification email." })
  } catch(e) {
    res.status(500).send({ message: "An error occurred when checking the password provided!" })
    AccountLogger.error(e)
  }
}

var authRouter = Router()

// authRouter.get('/request-registration', startAccountProcess);
authRouter.post('/register', createAccount)
authRouter.post('/login', loginAccount)
authRouter.post('/refresh', performAccessTokenRefresh)
authRouter.post('/update-password', verifyAccount, updatePassword)
authRouter.get('/permissions', verifyAccount, getPermissions)
authRouter.post('/update-email', verifyAccount, updateEmail)
authRouter.get('/email', verifyAccount, emailInfo)
authRouter.get('/resend-verify', verifyAccount, resendVerification)

export { authRouter, verifyAccount, verifyPermission }