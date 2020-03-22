const { dialog } = require('electron').remote
const FileReader = require('./service/FileReader')
const { Gantt } = require('./model/Model')
const Render = require('./render/Render')

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

    const fileReader = new FileReader(filePath)
    const ganttData = await fileReader.read()
    const gantt = new Gantt(ganttData)

    const target = document.getElementById('render-target')
    new Render(gantt, {
      elementHeight: 20,
      dayWidth: 22,
    }).render(target)
  }
}