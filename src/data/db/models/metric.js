import { DataTypes } from "sequelize"
import db from "../config/index"

import { v4 as uuid } from "uuid"
import { DEBUG } from "@/helper/args"

const Metric = db.define('Metric', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    not_null: true,
    defaultValue: () => uuid()
  },
  route: {
    type: DataTypes.STRING,
    not_null: true
  },
  method: {
    type: DataTypes.STRING,
    not_null: true
  },
  statusCode: {
    type: DataTypes.INTEGER,
    not_null: true
  },
  timestamp: {
    type: DataTypes.DATE,
    not_null: true
  }
}, {
  createdAt: false,
  updatedAt: false
})

// Clean up once done testing
Metric.sync({ force: DEBUG })

export { Metric }