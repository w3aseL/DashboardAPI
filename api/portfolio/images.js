import { uploadFile, deleteFile } from "../../data/s3"
import { Image } from "../../data/database"
import { DEV_FOLDER } from "./index"

const SITE_URL = "https://content.noahtemplet.dev/"

/****************************/
/*          IMAGES          */
/****************************/

export const getAllImages = async (req, res, next) => {
  const allImages = await Image.findAll()

  var images = []

  allImages.forEach(img => {
    images.push({ id: img.id, file_name: img.fileName, url: img.url })
  })

  res.status(200).send({ images })
}

export const getImage = async (req, res, next) => {
  const { id } = req.params

  const img = await Image.findOne({ where: { id } })

  if(!img) {
    res.status(400).send({ message: "There is no image that exists with that identifier!" })
    return
  }

  res.status(200).send({ id: img.id, file_name: img.file_name, url: img.url })
}

export const deleteImage = async (req, res, next) => {
  const { id } = req.body

  if(!id) {
    res.status(400).send({ message: "An identifier must be provided to delete an image!" })
    return
  }

  const img = await Image.findOne({ where: { id } })

  if(!img) {
    res.status(400).send({ message: "There is no image that exists with that identifier!" })
    return
  }

  deleteFile(img.key)
  .then(async _ => {
    await img.destroy()

    res.status(200).send({ message: "Successfully deleted image!" })
  })
  .catch(err => {
    res.status(500).send({ message: "An error has occurred when deleting an image!", error: err })
    return
  })
}