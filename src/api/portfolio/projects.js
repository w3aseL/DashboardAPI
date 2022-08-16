import { Op } from "sequelize"

import { uploadFile } from "@/data/s3"
import { Project, ProjectImage, ProjectTool, Image, Tool, Category } from "@/data/database"
import { DEV_FOLDER } from "./index"

const SITE_URL = "https://content.noahtemplet.dev/"

/****************************/
/*         PROJECTS         */
/****************************/

export const getProjects = async (req, res, next) => {
  const projectObjs = await Project.findAll({
    include: [
      {
        model: Image,
        attributes: [ "url" ],
        through: {
          attributes: [ "is_logo" ] 
        }
      },
      {
        model: Tool,
        attributes: [ "name", "description", "url" ],
        include:  [
          {
            model: Image,
            attributes: [ "url" ],
          },
          {
            model: Category,
            attributes: [ "name" ],
          }
        ]
      }
    ]
  })

  var projects = []

  for(let i = 0; i < projectObjs.length; i++) {
    const project = projectObjs[i]

    var projectObj = {
      id: project.id,
      name: project.name,
      description: project.description,
      url: project.url,
      repo_url: project.repoUrl,
      images: [],
      tools: []
    }

    project.Images.forEach(img => {
      if(img.ProjectImage.dataValues.is_logo == 1)
        projectObj.logo_url = img.url
      else
        projectObj.images.push(img.url) 
    })

    project.Tools.forEach(tool => {
      var toolObj = { name: tool.name, url: tool.url }

      if(tool.Image)
        toolObj.logo_url = tool.Image.url

      if(tool.Category)
        toolObj.category = tool.Category.name

      projectObj.tools.push(toolObj)
    })

    projects.push(projectObj)
  }

  res.status(200).send({ projects })
  return
}

export const createProject = async (req, res, next) => {
  const { name, description, url, repo_url, logo_id, images, tools } = req.body

  if(images && !Array.isArray(images)) {
    res.status(400).send({ message: "Images must be an array of ids!" })
    return
  }

  if(tools && !Array.isArray(images)) {
    res.status(400).send({ message: "Tools must be an array of ids!" })
    return
  }

  if(!name || !description || !url || !repo_url) {
    res.status(400).send({ message: "One field is not filled out!" })
    return
  }

  const project = await Project.create({ name, description, url, repoUrl: repo_url })

  if(logo_id) {
    const logo = await Image.findOne({ where: { id: logo_id } })

    if(!logo) {
      res.status(400).send({ message: "Could not find a logo with that id!" })
      return
    }

    await ProjectImage.create({ ProjectId: project.id, ImageId: logo.id, isLogo: true })
  }

  if(images.length > 0) {
    const imageObjs = await Image.findAll({ where: { id: images } })

    for(let i = 0; i < imageObjs.length; i++) {
      const img = imageObjs[i]
  
      await ProjectImage.create({ ProjectId: project.id, ImageId: img.id })
    }
  }

  if(tools.length > 0) {
    const toolObjs = await Tool.findAll({ where: { id: tools } })

    for(let i = 0; i < toolObjs.length; i++) {
      const tool = toolObjs[i]
  
      await ProjectTool.create({ ProjectId: project.id, ToolId: tool.id })
    }
  }

  res.status(201).send({ message: `Successfully created project ${project.name}!`, id: project.id })
  return
}

export const uploadProjectImage = async (req, res, next) => {
  if(!req.files) {
    res.status(400).send({ message: "No image has been provided!" })
    return
  }

  const { image } = req.files

  if(!image) {
    res.status(400).send({ message: "No resume has been provided!" })
    return
  }

  const { is_logo } = req.body

  const folder = `${DEV_FOLDER}projects${is_logo && is_logo === "true" ? "/logos" : ""}`, url = `${SITE_URL}${folder}/${image.name}`

  uploadFile(folder, image.name, image.data)
  .then(async isUploaded => {
    const newImage = await Image.create({ fileName: image.name, url, creationDate: new Date(), key: `${folder}/${image.name}` })

    res.status(201).send({ message: "The image has been successfully uploaded!", id: newImage.id, url: newImage.url })
  })
  .catch(err => {
    res.status(500).send({ message: "An error occurred when uploading the file to the S3 bucket!", err })
  })
}

export const deleteProject = async (req, res, next) => {
  const { id } = req.body

  if(!id) {
    res.status(400).send({ message: "A valid identifier was not provided!" })
    return
  }

  const project = await Project.findOne({ where: { id } })

  if(!project) {
    res.status(400).send({ message: "A project was not found with that id!" })
    return
  }

  await project.destroy()

  res.status(200).send({ message: "Deleted the project!" })
  return
}