import { Router } from "express"

const mobileRouter = Router()

mobileRouter.get('/test', (req, res) => {
  res.status(200).send({ msg: "ok!" })
})

mobileRouter.post('/testpost', (req, res) => {
  const data = req.body

  console.log(data)

  res.status(200).send({ msg: "Received data!" })
})

export { mobileRouter }