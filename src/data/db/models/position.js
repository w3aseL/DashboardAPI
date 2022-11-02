import generator from "generate-password"

import { DataTypes } from "sequelize"
import db from "../config/index"

import { Image } from "./index"

const Position = db.define('Position', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: () => {
      const str = generator.generate({ length: 12, uppercase: true, lowercase: true, symbols: false, numbers: true })
      return str
    }
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "job_title"
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "company_name"
  },
  companyUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "company_url"
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: "start_date"
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: "end_date"
  }
}, {
  createdAt: false,
  updatedAt: false
})

Position.belongsTo(Image)

Position.sync()

export { Position }