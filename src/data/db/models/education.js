import generator from "generate-password"

import { DataTypes } from "sequelize"
import db from "../config/index"

import { Image } from "./index"

const Education = db.define('Education', {
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
  schoolName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "school_name"
  },
  schoolType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "school_type"
  },
  schoolUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "school_url"
  },
  rewardType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "reward_type"
  },
  major: {
    type: DataTypes.STRING,
    allowNull: true
  },
  graduationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: "graduation_date"
  },
  gpa: {
    type: DataTypes.DECIMAL(2),
    allowNull: false
  }
}, {
  createdAt: false,
  updatedAt: false
})

Education.belongsTo(Image)

Education.sync()

export { Education }