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

  let toolList = {}, resumeList = [], educationList = [], projectList = [], positionList = []

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

  const educationObjs = await Education.findAll({ include: { model: Image, attributes: [ "url" ] } })

  educationObjs.forEach(edu => {
    var eduObj = { school_name: edu.schoolName, school_type: edu.schoolType, graduation_reward: edu.rewardType, graduation_date: edu.graduationDate, gpa: edu.gpa }

    if(edu.schoolUrl)
    eduObj.school_url = edu.schoolUrl

  if(edu.major)
    eduObj.major = edu.major

  if(edu.Image)
    eduObj.school_logo = edu.Image.url

  educationList.push(eduObj)
  })

  const resumeObjs = await Resume.findAll()

  resumeObjs.forEach(resume => {
    resumeList.push({ url: resume.url, creation_date: resume.creationDate })
  })

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

  projectObjs.forEach(project => {
    var projectObj = {
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

    projectList.push(projectObj)
  })

  const positionObjs = await Position.findAll({
    include: {
      model: Image,
      attributes: [ "url" ]
    }
  })

  positionObjs.forEach(pos => {
    var posObj = {
      job_title: pos.jobTitle,
      company_name: pos.companyName,
      company_url: pos.companyUrl,
      description: pos.description,
      start_date: pos.startDate,
      end_date: pos.endDate
    }

    if(pos.Image)
      posObj.logo_url = pos.Image.url

    positionList.push(posObj)
  })

  res.status(200).send({
    tools: toolList,
    resumes: resumeList.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date)),
    education: educationList,
    projects: projectList,
    positions: positionList
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