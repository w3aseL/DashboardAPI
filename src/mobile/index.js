import { Device } from "@/data/db/models/index"

export const createDeviceToken = async deviceInfo => {
  const device = await Device.create(deviceInfo)

  return device.id
}

export const verifyDeviceToken = async token => {
  const device = await Device.findOne({
    where: { id: token},
    attributes: [ 'deviceId', 'deviceName', 'manufacturer' ],
    raw: true
  })

  if(!device) throw new Error("Could not find a device with the token provided.")

  return device
}