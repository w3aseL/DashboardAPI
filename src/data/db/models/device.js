import { DataTypes } from "sequelize"
import db from "../config/index"

import { v4 as uuid } from 'uuid'

const Device = db.define('Device', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    not_null: true,
    defaultValue: () => uuid()
  },
  deviceName: {
    type: DataTypes.STRING,
    not_null: true
  },
  deviceId: {
    type: DataTypes.STRING,
    not_null: true
  },
  manufacturer: {
    type: DataTypes.STRING,
    not_null: true
  }
}, {
  createdAt: false,
  updatedAt: false
})

Device.sync()

export { Device }