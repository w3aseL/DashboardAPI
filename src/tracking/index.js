import { Metric } from "@/data/db/models/metric"
import { Op } from "sequelize/dist"

export const createMetric = async data => {
  await Metric.create(data)
}

export const getAllMetrics = async (limit=100, offset=0, startDate, endDate) => {
  if(!startDate) startDate = new Date(2010, 1, 1)
  if(!endDate) endDate = Date.now()

  const records = await Metric.findAll({
    attributes: [ 'route', 'method', 'statusCode', 'timestamp', 'hostname' ],
    where: {
      timestamp: {
        [Op.between]: [startDate, endDate]
      }
    }
  })
  
  return {
    records: records.slice(offset, offset+limit),
    count: records.length
  }
}