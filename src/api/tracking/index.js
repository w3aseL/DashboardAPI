import { getAllMetrics } from "@/tracking/index"
import { Router } from "express"
import { verifyAccount, verifyPermission } from "../auth/index"

const getMetrics = async (req, res, next) => {
  var limit = req.query.limit && req.query.limit > 0 ? Number(req.query.limit) : 100
  var offset = req.query.offset && req.query.offset >= 0 ? Number(req.query.offset) : 0
  var startDate = req.query.start_date ? new Date(req.query.start_date) : null
  var endDate = req.query.end_date ? new Date(req.query.end_date) : null

  try {
    const metrics = await getAllMetrics(limit, offset, startDate, endDate)

    res.status(200).send({ ...metrics })
  } catch(e) {
    res.status(500).send({ message: e.message })
    return
  }
}

const trackingRouter = Router()

trackingRouter.use(verifyAccount, (req, res, next) => verifyPermission("administrator", req, res, next))

trackingRouter.get("/stats", getMetrics)

export { trackingRouter }