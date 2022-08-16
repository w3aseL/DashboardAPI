import fs from "fs"
import path from "path"
import AWS from "aws-sdk"
import keys from '@/data/keys'

const s3 = new AWS.S3({
  accessKeyId: keys.aws.access,
  secretAccessKey: keys.aws.secret
})

export const uploadFile = async (folder, name, data) => {
  const params = {
    Bucket: keys.aws.bucket,
    Key: `${folder}/${name}`,
    Body: data
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if(err) reject(err)

      //console.log(`File uploaded to ${data.Location}`)
      resolve(true)
    })
  })
}

export const deleteFile = async (fileKey) => {
  const params = {
    Bucket: keys.aws.bucket,
    Key: fileKey
  }

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => {
      if(err) reject(err)

      resolve(true)
    })
  })
}