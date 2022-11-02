import generator from "generate-password"

import { DataTypes } from "sequelize"
import db from "../config/index"

const Image = db.define('Image', {
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
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileName: { 
    type: DataTypes.STRING,
    allowNull: false,
    field: "file_name"
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  createdAt: false,
  updatedAt: false
})

Image.sync()

export { Image }