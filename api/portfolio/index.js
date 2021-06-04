import express from "express"
import { uploadFile } from "../../data/s3"
import { Category, Tool, Image, Position, Project, Resume, Education } from "../../data/database"
import { DEBUG } from "../../helper/args"

import { verifyAccount } from "../auth"

import { getCategories, createCategory, removeCategory } from "./categories"
import { getTools, getTool, createTool, deleteTool, uploadToolLogo } from "./tools"
import { deleteResume, getResumes, updateResumeCreationDate, uploadResume } from "./resumes"
import { createEducationObj, getAllEducation, getEducationById, uploadSchoolLogo } from "./education"
import { deleteImage, getAllImages, getImage } from "./images"

export const SITE_URL = "https://content.noahtemplet.dev/", DEV_FOLDER = DEBUG ? "test-content/" : ""

// USE AS REFERENCE
export const uploadImage = async (req, res, next) => {
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

var portfolioRouter = express.Router()

// PUBLIC ROUTES

// PRIVATE ROUTES
portfolioRouter.route('/category')
  .get(verifyAccount, getCategories)
  .post(verifyAccount, createCategory)
  .delete(verifyAccount, removeCategory)

portfolioRouter.route('/tool')
  .get(verifyAccount, getTools)
  .post(verifyAccount, createTool)
  .delete(verifyAccount, deleteTool)

portfolioRouter.get('/tool/:id', verifyAccount, getTool)
portfolioRouter.post('/tool/upload-image', verifyAccount, uploadToolLogo)

portfolioRouter.route('/resume')
  .get(verifyAccount, getResumes)
  .post(verifyAccount, uploadResume)
  .delete(verifyAccount, deleteResume)

portfolioRouter.patch('/resume/:id', verifyAccount, updateResumeCreationDate)

portfolioRouter.route('/education')
  .get(verifyAccount, getAllEducation)
  .post(verifyAccount, createEducationObj)

portfolioRouter.get('/education/:id', verifyAccount, getEducationById)
portfolioRouter.post('/education/upload-image', verifyAccount, uploadSchoolLogo)

portfolioRouter.route('/image')
  .get(verifyAccount, getAllImages)
  .delete(verifyAccount, deleteImage)

portfolioRouter.get('/image/:id', verifyAccount, getImage)

export { portfolioRouter }