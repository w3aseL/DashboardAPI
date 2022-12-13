import { createTransport } from "nodemailer"

import keys from "@/data/keys"

let transport = createTransport({
  host: 'smtppro.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: keys.email.username,
    pass: keys.email.password
  }
})

// Email message type example
const DEFAULT_EMAIL_MESSAGE = {
  from: "No Reply <no-reply@noahtemplet.dev>",
  to: "",
  cc: "",
  subject: "",
  body: "",
  html: ""
}

const EmailMessage = DEFAULT_EMAIL_MESSAGE

/**
 * Send Email
 * -----------------
 * Sends an email with the provided options
 * 
 * @param {EmailMessage} emailOptions
 * @returns {Promise}
 */
export const sendEmail = (emailOptions) => {
  return transport.sendMail({
    ...DEFAULT_EMAIL_MESSAGE,
    ...emailOptions
  })
}