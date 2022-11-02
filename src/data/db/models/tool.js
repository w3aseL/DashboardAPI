import { DataTypes } from "sequelize"
import db from "../config/index"
import { Category, Image } from "./index"

const Tool = db.define('Tool', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  createdAt: false,
  updatedAt: false
})

Tool.belongsTo(Category)
Tool.belongsTo(Image)

Tool.sync()

export { Tool }