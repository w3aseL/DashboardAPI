import { uploadFile, deleteFile } from "../../data/s3"
import { Resume } from "../../data/database"
import { DEV_FOLDER } from "./index"

const SITE_URL = "https://content.noahtemplet.dev/"

/****************************/
/*          RESUME          */
/****************************/

export const uploadResume = async (req, res, next) => {
  if(!req.files) {
    res.status(400).send({ message: "No file has been provided!" })
    return
  }

  const { resume } = req.files

  if(!resume) {
    res.status(400).send({ message: "No resume has been provided!" })
    return
  }

  const folder = `${DEV_FOLDER}resumes`, url = `${SITE_URL}${folder}/${resume.name}`

  uploadFile(folder, resume.name, resume.data)
  .then(async isUploaded => {
    const newResume = await Resume.create({ fileName: resume.name, url, creationDate: new Date(), key: `${folder}/${resume.name}` })

    res.status(201).send({ message: "The resume has been successfully uploaded!", id: newResume.id, url: newResume.url })
  })
  .catch(err => {
    res.status(500).send({ message: "An error occurred when uploading the file to the S3 bucket!", err })
  })
}

export const updateResumeCreationDate = async (req, res, next) => {
  const { id } = req.params
  const { date } = req.body

  if(!id) {
    res.status(400).send({ message: "A valid identifier was not provided!" })
    return
  }

  if(!date) {
    res.status(400).send({ message: "A date was not given!" })
    return
  }

  const resume = await Resume.findOne({ where: { id }})

  if(!resume) {
    res.status(400).send({ message: "A resume does not exist with that identifier!" })
    return
  }

  await resume.update({ creationDate: new Date(date) })

  res.status(200).send({ message: "The resume has been successfully updated!" })
}

export const getResumes = async (req, res, next) => {
  const resumeObjs = await Resume.findAll()

  var resumes = []

  resumeObjs.forEach(resume => {
    resumes.push({ url: resume.url, creation_date: resume.creationDate, file_name: resume.fileName, id: resume.id })
  })

  res.status(200).send({ resumes })
}

export const deleteResume = async (req, res, next) => {
  const { id } = req.body

  if(!id) {
    res.status(400).send({ message: "A valid identifier was not provided!" })
    return
  }

  const resume = await Resume.findOne({ where: { id }})

  if(!resume) {
    res.status(400).send({ message: "A resume does not exist with that identifier!" })
    return
  }

  deleteFile(resume.key)
  .then(async _ => {
    await resume.destroy()

    res.status(200).send({ message: "Successfully deleted resume!" })
  })
  .catch(err => {
    res.status(500).send({ message: "An error has occurred when deleting the resume!", error: err })
    return
  })
}