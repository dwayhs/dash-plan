module.exports = class FileReader {
  constructor(filePath) {
    this.filePath = filePath
  }

  read() {
    console.log('reading', this.filePath)
  }
}