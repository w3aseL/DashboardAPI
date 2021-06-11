import express from "express"
import { uploadFile } from "../../data/s3"
import { Category, Tool, Image, Position, Project, Resume, Education } from "../../data/database"
import { DEBUG } from "../../helper/args"

import { verifyAccount } from "../auth"

import { getCategories, createCategory, removeCategory } from "./categories"
import { getTools, getTool, createTool, deleteTool, uploadToolLogo, updateTool } from "./tools"
import { deleteResume, getResumes, updateResumeCreationDate, uploadResume } from "./resumes"
import { createEducationObj, deleteEducation, getAllEducation, getEducationById, uploadSchoolLogo } from "./education"
import { deleteImage, getAllImages, getImage } from "./images"
import { createProject, deleteProject, getProjects, uploadProjectImage } from "./projects"
import { createPosition, deletePosition, getPosition, getPositions, updatePosition, uploadCompanyLogo } from "./positions"

export const SITE_URL = "https://content.noahtemplet.dev/", DEV_FOLDER = DEBUG ? "test-content/" : ""

// USE AS REFERENCE
const uploadImage = async (req, res, next) => {
  if(!req.files) {
    res.status(400).send({ message: "No image has been provided!" })
    return
  }

  const { image } = req.files

  if(!image) {
    res.status(400).send({ message: "No image has been provided!" })
    return
  }

  uploadFile("test", image.name, image.data)
  .then(isUploaded => {
    res.status(201).send({ message: "The file was uploaded successfully to the S3 bucket!" })
  })
  .catch(err => {
    res.status(500).send({ message: "An error occurred when uploading the file to the S3 bucket!", err })
  })
}

const requestAllData = async (req, res, next) => {
  const tools = await Tool.findAll()

  let toolList = {}, resumeList = [], educationList = []

  const placeToolInCategory = (tool, category) => {
    if(!toolList[category])
      toolList[category] = []
    
    toolList[category].push(tool)
  }

  for(let i = 0; i < tools.length; i++) {
    const tool = tools[i], img = await tool.getImage(), category = await tool.getCategory()

    var toolObj = { name: tool.name, url: tool.url, description: tool.description }

    if(img)
      toolObj.logo_url = img.url

    if(category){
      placeToolInCategory(toolObj, category.name)
    }
    else
      placeToolInCategory(toolObj, "Other")
  }

  const educationObjs = await Education.findAll()

  for(let i = 0; i < educationObjs.length; i++) {
    var obj = educationObjs[i], eduObj = { school_name: obj.schoolName, school_type: obj.schoolType, graduation_reward: obj.rewardType, graduation_date: obj.graduationDate, gpa: obj.gpa }

    const logo = await obj.getImage()

    if(obj.schoolUrl)
      eduObj.school_url = obj.schoolUrl

    if(obj.major)
      eduObj.major = obj.major

    if(logo)
      eduObj.school_logo = logo.url

    educationList.push(eduObj)
  }

  const resumeObjs = await Resume.findAll()

  resumeObjs.forEach(resume => {
    resumeList.push({ url: resume.url, creation_date: resume.creationDate })
  })

  res.status(200).send({
    tools: toolList,
    resumes: resumeList.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date)),
    education: educationList
  })
}

var portfolioRouter = express.Router()

// PUBLIC ROUTES
portfolioRouter.get('/', requestAllData)

// PRIVATE ROUTES
portfolioRouter.route('/category')
  .get(verifyAccount, getCategories)
  .post(verifyAccount, createCategory)
  .delete(verifyAccount, removeCategory)

portfolioRouter.route('/tool')
  .get(verifyAccount, getTools)
  .post(verifyAccount, createTool)
  .delete(verifyAccount, deleteTool)

portfolioRouter.route('/tool/:id')
  .get(verifyAccount, getTool)
  .patch(verifyAccount, updateTool)
portfolioRouter.post('/tool/upload-image', verifyAccount, uploadToolLogo)

portfolioRouter.route('/resume')
  .get(verifyAccount, getResumes)
  .post(verifyAccount, uploadResume)
  .delete(verifyAccount, deleteResume)

portfolioRouter.patch('/resume/:id', verifyAccount, updateResumeCreationDate)

portfolioRouter.route('/education')
  .get(verifyAccount, getAllEducation)
  .post(verifyAccount, createEducationObj)
  .delete(verifyAccount, deleteEducation)

portfolioRouter.get('/education/:id', verifyAccount, getEducationById)
portfolioRouter.post('/education/upload-image', verifyAccount, uploadSchoolLogo)

portfolioRouter.route('/image')
  .get(verifyAccount, getAllImages)
  .delete(verifyAccount, deleteImage)

portfolioRouter.get('/image/:id', verifyAccount, getImage)

portfolioRouter.route('/project')
  .get(verifyAccount, getProjects)
  .post(verifyAccount, createProject)
  .delete(verifyAccount, deleteProject)

portfolioRouter.post('/project/upload-image', verifyAccount, uploadProjectImage)

portfolioRouter.route('/position')
  .get(verifyAccount, getPositions)
  .post(verifyAccount, createPosition)
  .delete(verifyAccount, deletePosition)

portfolioRouter.post('/position/upload-image', verifyAccount, uploadCompanyLogo)
portfolioRouter.route('/position/:id')
  .get(verifyAccount, getPosition)
  .patch(verifyAccount, updatePosition)

export { portfolioRouter }