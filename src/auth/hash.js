import bcrypt from "bcrypt"
import generator from "generate-password"

const SALT_ROUNDS = 10;

export const generateRandomString = function(length=6){
  return generator.generate({ length: length, numbers: true, symbols: true })
}

export const hashPassword = (password, callback) => {
  bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
    if(err) throw err
    
    bcrypt.hash(password, salt, (err, encrypted) => {
      if(err) throw err

      callback(encrypted)
    })
  })
}

export const checkPassword = (password, encrypted, callback) => {
  bcrypt.compare(password, encrypted, (err, res) => {
    if(err) throw err

    callback(res)
  })
}