const fs = require('fs')

const keys = JSON.parse(fs.readFileSync('./keys.json'))

export default keys