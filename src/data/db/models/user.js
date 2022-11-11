import { DataTypes } from "sequelize"
import db from "../config/index"

import { v4 as uuid } from "uuid"

const User = db.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  uuid: {
    type: DataTypes.STRING,
    not_null: true,
    unique: true,
    defaultValue: () => uuid()
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "display_name"
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verifiedEmail: { 
    type: DataTypes.BOOLEAN,
    not_null: true,
    defaultValue: false
  },
  permissionLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  createdAt: false,
  updatedAt: false
})

User.sync({ alter: true })

export { User }