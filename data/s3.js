import fs from "fs"
import path from "path"
import AWS from "aws-sdk"
import keys from '../keys.json'

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