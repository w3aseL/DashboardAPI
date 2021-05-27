import { uploadFile } from "../../data/s3"
import { Category, Tool, Image, Position, Project, Resume, Education } from "../../data/database"

const SITE_URL = "https://content.noahtemplet.dev/"

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

export * from "./categories"
export * from "./tools"
export * from "./resumes"
export * from "./education"