import { createDeviceToken, verifyDeviceToken } from "@/mobile/index"
import { Router } from "express"

const requestToken = async (req, res, next) => {
  const deviceInfo = req.body

  try {
    const token = await createDeviceToken(deviceInfo)

    res.status(201).send({ token })
  } catch(e) {
    res.status(500).send({ message: e.message })
  }
}

const verifyMobileToken = async (req, res, next) => {
  const token = req.header('X-Mobile-Authorization')

  try {
    const deviceInfo = await verifyDeviceToken(token)

    req.deviceInfo = deviceInfo;

    next();
  } catch(e) {
    res.status(500).send({ message: e.message })
  }
}

const mobileRouter = Router()

mobileRouter.post('/request-token', requestToken)
mobileRouter.get('/ping-verify', verifyMobileToken, (req, res) => {
  res.status(200).send({ msg: "Pong!!" })
})

export { mobileRouter }