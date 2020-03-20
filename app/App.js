const { dialog } = require('electron').remote
const FileReader = require('./service/FileReader')

module.exports = class App {
  start () {
    console.log('App starting')
    this.bindEventListeners()
  }

  bindEventListeners () {
    document.getElementById('selectFileButton').addEventListener('click', this.selectFileButtonClickHandler)
  }

  selectFileButtonClickHandler = async (e) => {
    const file = await dialog.showOpenDialog({ properties: ['openFile'] })
    const { filePaths } = file

    if (!filePaths.length) return

    const filePath = filePaths.pop()
    console.log('filePath', filePath)
  }
}