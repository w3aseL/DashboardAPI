const fs = require('fs')

export default class JSONFile {
  constructor(directory, file) {
    this.fileDir = process.cwd() + directory
    this.fileLoc = this.fileDir + file

    if(!fs.existsSync(this.fileDir))
      fs.mkdirSync(this.fileDir, { recursive: true })

    if(!fs.existsSync(this.fileLoc))
      fs.writeFileSync(this.fileLoc, JSON.stringify({}))
  }

  getData() {
    return fs.readFileSync(this.fileLoc)
  }

  updateData(jsonData) {
    fs.writeFileSync(this.fileLoc, JSON.stringify(jsonData))
  }
}