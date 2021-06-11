import { uploadFile } from "../../data/s3"
import { Position, Image } from "../../data/database"
import { DEV_FOLDER } from "./index"

const SITE_URL = "https://content.noahtemplet.dev/"

/****************************/
/*        POSITIONS         */
/****************************/

export const getPositions = async (req, res, next) => {
  const positionObjs = await Position.findAll({
    include: {
      model: Image,
      attributes: [ "url" ]
    }
  })

  var positions = []

  positionObjs.forEach(pos => {
    var posObj = {
      id: pos.id,
      job_title: pos.jobTitle,
      company_name: pos.companyName,
      company_url: pos.companyUrl,
      description: pos.description,
      start_date: pos.startDate,
      end_date: pos.endDate
    }

    if(pos.Image)
      posObj.logo_url = pos.Image.url

    positions.push(posObj)
  })

  res.status(200).send({ positions: positions })
}

export const getPosition = async (req, res, next) => {
  const { id } = req.params

  if(!id) {
    res.status(400).send({ message: "A valid identifier was not provided!" })
    return
  }

  const pos = await Position.findOne({ where: { id }, include: { model: Image, attributes: [ "id", "url" ] } })

  if(!pos) {
    res.status(400).send({ message: "A position was not found with that id!" })
    return
  }

  res.status(200).send({
    job_title: pos.jobTitle,
    company_name: pos.companyName,
    company_url: pos.companyUrl,
    description: pos.description,
    start_date: pos.startDate,
    end_date: pos.endDate,
    logo_id: pos.Image ? pos.Image.id : "",
    logo_url: pos.Image ? pos.Image.url : ""
  })
}

export const createPosition = async (req, res, next) => {
  const { job_title, company_name, company_url, description, start_date, end_date, logo_id } = req.body

  if(!job_title || !company_name || !description || !start_date) {
    res.status(400).send({ message: "One of the fields required is not filled out!" })
    return
  }

  const newPos = await Position.create({
    jobTitle: job_title,
    companyName: company_name,
    companyUrl: company_url,
    description,
    startDate: start_date,
    endDate: end_date,
    ImageId: logo_id
  })

  res.status(201).send({ message: "Created new position!", id: newPos.id })
}

export const updatePosition = async (req, res, next) => {
  const { id } = req.params

  if(!id) {
    res.status(400).send({ message: "A valid identifier was not provided!" })
    return
  }

  const pos = await Position.findOne({ where: { id }, include: { model: Image, attributes: [ "id", "url" ] } })

  if(!pos) {
    res.status(400).send({ message: "A position was not found with that id!" })
    return
  }

  // cause i'm dumb and made the fields different names i gotta make it difficult...
  const posKeys = {
    job_title: "jobTitle",
    company_name: "companyName",
    company_url: "companyUrl",
    description: "description",
    start_date: "startDate",
    end_date: "endDate",
    logo_id: "ImageId"
  }

  var updateObj = {}

  Object.keys(req.body).forEach(key => {
    if(req.body[key] !== pos[posKeys[key]]) {
      updateObj[posKeys[key]] = req.body[key]
    }
  })

  if(updateObj === {}) {
    res.status(400).send({ message: "No fields are provided to update!" })
    return
  }

  await pos.update(updateObj)

  res.status(200).send({
    message: `Updated position with id ${id}!`,
    position: {
      job_title: pos.jobTitle,
      company_name: pos.companyName,
      company_url: pos.companyUrl,
      description: pos.description,
      start_date: pos.startDate,
      end_date: pos.endDate,
      logo_url: pos.Image ? pos.Image.url : ""
    }
  })
}

export const deletePosition = async (req, res, next) => {
  const { id } = req.body

  if(!id) {
    res.status(400).send({ message: "A valid identifier was not provided!" })
    return
  }

  const pos = await Position.findOne({ where: { id } })

  if(!pos) {
    res.status(400).send({ message: "A position was not found with that id!" })
    return
  }

  await pos.destroy()

  res.status(200).send({ message: "Deleted the position!" })
}

export const uploadCompanyLogo = async (req, res, next) => {
  if(!req.files) {
    res.status(400).send({ message: "No image has been provided!" })
    return
  }

  const { logo } = req.files

  if(!logo) {
    res.status(400).send({ message: "No logo has been provided!" })
    return
  }

  const folder = `${DEV_FOLDER}company/logos`, url = `${SITE_URL}${folder}/${logo.name}`

  uploadFile(folder, logo.name, logo.data)
  .then(async isUploaded => {
    const newImage = await Image.create({ fileName: logo.name, url, creationDate: new Date(), key: `${folder}/${logo.name}` })

    res.status(201).send({ message: "The image has been successfully uploaded!", id: newImage.id, url: newImage.url })
  })
  .catch(err => {
    res.status(500).send({ message: "An error occurred when uploading the file to the S3 bucket!", err })
  })
}