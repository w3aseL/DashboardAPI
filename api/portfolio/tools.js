import { uploadFile } from "../../data/s3"
import { Category, Tool, Image } from "../../data/database"

import { DEV_FOLDER } from "./index"

const SITE_URL = "https://content.noahtemplet.dev/"

/****************************/
/*           TOOLS          */
/****************************/

export const uploadToolLogo = async (req, res, next) => {
  if(!req.files) {
    res.status(400).send({ message: "No image has been provided!" })
    return
  }

  const { logo } = req.files

  if(!logo) {
    res.status(400).send({ message: "No logo has been provided!" })
    return
  }

  const folder = `${DEV_FOLDER}tools/logos`, url = `${SITE_URL}${folder}/${logo.name}`

  uploadFile(folder, logo.name, logo.data)
  .then(async isUploaded => {
    const image = await Image.create({ fileName: logo.name, url, key: `${folder}/${logo.name}` })

    res.status(201).send({ message: "The tool image has been successfully uploaded!", id: image.id, url: image.url })
  })
  .catch(err => {
    res.status(500).send({ message: "An error occurred when uploading the file to the S3 bucket!", err })
  })
}

export const createTool = async (req, res, next) => {
  const { name, url, description, logo_id, category } = req.body

  if(!name || !url || !description) {
    res.status(400).send({ message: "One of the fields is not filled out!" })
    return
  }

  const existingTool = await Tool.findOne({ where: { name } })

  if(existingTool) {
    res.status(400).send({ message: "A tool with that name already exists!" })
    return
  }

  var tool = await Tool.create({ name, url, description })

  if(logo_id) {
    const logo = await Image.findOne({ where: { id: logo_id } })

    if(!logo) {
      res.status(400).send({ message: "Could not find image with that id!" })
      return
    }

    tool.setImage(logo)
  }

  if(category) {
    var categoryObj = await Category.findOne({ where: { name: category } })

    if(!category) {
      categoryObj = await Category.create({ name: category })
    }

    tool.setCategory(categoryObj)
  }

  res.status(201).send({ message: `Successfully created tool for ${name}!` })
}

export const getTools = async (req, res, next) => {
  const tools = await Tool.findAll()

  var toolList = []

  for(let i = 0; i < tools.length; i++) {
    const tool = tools[i]

    const image = await tool.getImage(), category = await tool.getCategory()

    var toolObj = { id: tool.id, name: tool.name, url: tool.url, description: tool.description }

    if(image) {
      toolObj.logo_url = image.url
    }

    if(category) {
      toolObj.category = category.name
    }

    toolList.push(toolObj)
  }

  res.status(200).send({ tools: toolList })
}

export const getTool = async (req, res, next) => {
  const { id } = req.params

  if(!id) {
    res.status(400).send({ message: "A valid identifier was not provided!" })
    return
  }

  const tool = await Tool.findOne({ where: { id } })

  if(!tool) {
    res.status(400).send({ message: "A tool with that id was not found!" })
    return
  }

  var toolObj = { name: tool.name, url: tool.url, description: tool.description }

  const image = await tool.getImage(), category = await tool.getCategory()

  if(image) {
    toolObj.logo_url = image.url
  }

  if(category) {
    toolObj.category = category.name
  }

  res.status(200).send({ ...toolObj })
}

export const deleteTool = async (req, res, next) => {
  const { id, name } = req.body

  var existingTool

  if(id) {
    existingTool = await Tool.findOne({ where: { id } })
  } else if(name) {
    existingTool = await Tool.findOne({ where: { name } })
  } else if(!id && !name) {
    res.status(400).send({ message: "An id or name must be provided to delete a tool!" })
    return
  }

  if(!existingTool) {
    res.status(400).send({ message: "A tool does not exist with that id or name!" })
    return
  }

  existingTool.destroy()

  res.status(200).send({ message: "Tool with the given value has been deleted!" })
}