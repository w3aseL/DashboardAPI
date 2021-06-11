import { uploadFile } from "../../data/s3"
import { Image, Education } from "../../data/database"
import { DEV_FOLDER } from "./index"

const SITE_URL = "https://content.noahtemplet.dev/"

/****************************/
/*        EDUCATION         */
/****************************/

export const getAllEducation = async (req, res, next) => {
  const education = await Education.findAll()

  var educationArr = []

  for(let i = 0; i < education.length; i++) {
    var obj = education[i], eduObj = { id: obj.id, school_name: obj.schoolName, school_type: obj.schoolType, graduation_reward: obj.rewardType, graduation_date: obj.graduationDate, gpa: obj.gpa }

    const logo = await obj.getImage()

    if(obj.schoolUrl)
      eduObj.school_url = obj.schoolUrl

    if(obj.major)
      eduObj.major = obj.major

    if(logo)
      eduObj.school_logo = logo.url

    educationArr.push(eduObj)
  }

  res.status(200).send({ education: educationArr })
}

export const getEducationById = async (req, res, next) => {
  const { id } = req.params

  if(!id) {
    res.status(400).send({ message: "A valid identifier was not provided!" })
    return
  }

  const edu = await Education.findOne({ where: { id } })

  if(!edu) {
    res.status(400).send({ message: "An education object could not be found with that id!" })
    return
  }

  var eduObj = { id: edu.id, school_name: edu.schoolName, school_type: edu.schoolType, graduation_reward: edu.rewardType, graduation_date: edu.graduationDate, gpa: edu.gpa }

  const logo = await edu.getImage()

  if(edu.schoolUrl)
    eduObj.school_url = edu.schoolUrl

  if(edu.major)
    eduObj.major = edu.major

  if(logo) {
    eduObj.school_logo = logo.url
    eduObj.logo_id = logo.id
  }

    res.status(200).send({ ...eduObj })
}

export const createEducationObj = async (req, res, next) => {
  const { school_name, school_type, graduation_reward, major, graduation_date, logo_id, gpa } = req.body

  if(!school_name || !school_type || !graduation_reward || !graduation_date || !gpa) {
    res.status(400).send({ message: "Some fields are missing to create an Education object!" })
    return
  }

  var obj = { schoolName: school_name, schoolType: school_type, rewardType: graduation_reward, graduationDate: new Date(graduation_date), gpa }

  if(major) {
    obj.major = major
  }

  const educationObj = await Education.create(obj)

  if(logo_id) {
    const logo = await Image.findOne({ where: { id: logo_id } })

    if(!logo) {
      res.status(400).send({ message: "Could not find image with that id!" })
      return
    }

    await educationObj.setImage(logo)
  }

  res.status(200).send({ message: "Successfully created education object!", object: educationObj })
}

export const uploadSchoolLogo = async (req, res, next) => {
  if(!req.files) {
    res.status(400).send({ message: "No file has been provided!" })
    return
  }

  const { logo } = req.files

  if(!logo) {
    res.status(400).send({ message: "No logo has been provided!" })
    return
  }

  const folder = `${DEV_FOLDER}education/logo`, url = `${SITE_URL}${folder}/${logo.name}`

  uploadFile(folder, logo.name, logo.data)
  .then(async isUploaded => {
    const image = await Image.create({ fileName: logo.name, url, key: `${folder}/${logo.name}` })

    res.status(201).send({ message: "The logo has been successfully uploaded!", id: image.id, url: image.url })
  })
  .catch(err => {
    res.status(500).send({ message: "An error occurred when uploading the file to the S3 bucket!", err })
  })
}

export const deleteEducation = async (req, res, next) => {
  const { id } = req.body

  if(!id) {
    res.status(400).send({ message: "A valid identifier was not provided!" })
    return
  }

  const edu = await Education.findOne({ where: { id } })

  if(!edu) {
    res.status(400).send({ message: "A position was not found with that id!" })
    return
  }

  await edu.destroy()

  res.status(200).send({ message: "Deleted the education object!" })
}