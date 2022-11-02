import generator from "generate-password"

import { DataTypes } from "sequelize"
import db from "../config/index"

import { Image, Tool } from "./index"

const Project = db.define('Project', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  repoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "repo_url"
  }
}, {
  createdAt: false,
  updatedAt: false
})

const ProjectImage = db.define('ProjectImage', {
  isLogo: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: "is_logo"
  }
}, {
  createdAt: false,
  updatedAt: false
})

const ProjectTool = db.define('ProjectTool', {}, {
  createdAt: false,
  updatedAt: false
})

Image.belongsToMany(Project, { through: ProjectImage, onDelete: "cascade", onUpdate: "cascade" })
Project.belongsToMany(Image, { through: ProjectImage, onDelete: "cascade", onUpdate: "cascade" })

Tool.belongsToMany(Project, { through: ProjectTool, onDelete: "cascade", onUpdate: "cascade" })
Project.belongsToMany(Tool, { through: ProjectTool, onDelete: "cascade", onUpdate: "cascade" })

Project.sync()
ProjectTool.sync()
ProjectImage.sync()

export { Project, ProjectTool, ProjectImage }