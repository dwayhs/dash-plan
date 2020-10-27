const fs = require('fs')
const yaml = require('js-yaml')

module.exports = class FileReader {
  constructor (filePath) {
    this.filePath = filePath
  }

  readRaw () {
    console.log('reading', this.filePath)

    return new Promise((resolve, reject) => {
      fs.readFile(this.filePath, 'utf-8', (err, data) => {
        if (err) {
          alert('An error ocurred reading the file :' + err.message)
          return reject(err)
        }

        resolve(data)
      })
    })
  }

  async read () {
    const fileRaw = await this.readRaw()
    const fileData = this.parseYml(fileRaw)
    return fileData
  }

  parseYml (fileRaw) {
    try {
      return yaml.safeLoad(fileRaw)
    } catch (err) {
      alert('An error ocurred reading the file :' + err.message)
    }
  }

  buildModels () {
  }
}
