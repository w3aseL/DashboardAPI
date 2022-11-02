import generator from "generate-password"

import { DataTypes } from "sequelize"
import db from "../config/index"

const Resume = db.define('Resume', {
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
  fileName: { 
    type: DataTypes.STRING,
    allowNull: false,
    field: "file_name"
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  creationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: "creation_date"
  }
}, {
  createdAt: false,
  updatedAt: false
})

Resume.sync()

export { Resume }