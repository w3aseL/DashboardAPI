const fs = require('fs')
const path = require('path')

export default class JSONFile {
  constructor(directory, file) {
    this.fileDir = path.join(process.cwd(), directory)
    this.fileLoc = path.join(this.fileDir, file)

    if(!fs.existsSync(this.fileDir))
      fs.mkdirSync(this.fileDir, { recursive: true })

    if(!fs.existsSync(this.fileLoc))
      fs.writeFileSync(this.fileLoc, JSON.stringify({}))
  }

  getData() {
    return JSON.parse(fs.readFileSync(this.fileLoc).toString())
  }

  updateData(jsonData) {
    fs.writeFileSync(this.fileLoc, JSON.stringify(jsonData))
  }
}