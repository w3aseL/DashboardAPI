import { User } from "@/data/database"

const getUser = async (id, attributes=[ 'displayName', 'email', 'verifiedEmail' ]) => {
  return await User.findOne({
    where: { uuid: id },
    attributes
  })
}

/**
 * GetEmailInfo
 * -------------------
 * @param {string} id - User UUID
 * @returns Object with email and verification status
 */
export const getUserEmailInfo = async id => {
  const user = await getUser(id, [ 'email', 'verifiedEmail' ])

  return { email: user.email, verifiedEmail: user.verifiedEmail }
}

const sendVerificationEmail = (id, email) => {
  // TODO
}

/**
 * UpdateUserEmail
 * --------------
 * @param {string} id - User UUID
 * @param {string} email - User's New Email
 * @returns Object with email and verification status
 */
export const updateUserEmail = async (id, email) => {
  await User.update({ email, verifiedEmail: 0 }, { where: { uuid: id } })

  sendVerificationEmail(id, email)

  return { email, verifiedEmail: false }
}

/**
 * ResendVerificationEmail
 * -------------
 * @param {string} id - User UUID
 */
export const resendVerificationEmail = async (id) => {
  const user = await getUser(id, [ 'email', 'verifiedEmail' ])

  if(user.verifiedEmail) throw new Error("User's email is already verified!")

  sendVerificationEmail(id, user.email)
}