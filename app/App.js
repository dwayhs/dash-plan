const debounce = require('debounce');
const { dialog } = require('electron').remote
const FileReader = require('./service/FileReader')
const { Gantt } = require('./model/Model')
const Render = require('./render/Render')
const { saveSvgAsPng } = require('save-svg-as-png')

module.exports = class App {
  start () {
    console.log('App starting')
    this.bindEventListeners()

    this.openedFilePath = null
  }

  bindEventListeners () {
    document.getElementById('openFileButton').addEventListener('click', this.openFileButtonClickHandler)
    document.getElementById('exportButton').addEventListener('click', this.exportButtonClickHandler)
  }

  openFileButtonClickHandler = async (e) => {
    const file = await dialog.showOpenDialog({ properties: ['openFile'] })
    const { filePaths } = file

    if (!filePaths.length) return

    let filePath = filePaths.pop()

    await this.openFile(filePath)
  }

  openFile = async (filePath) => {
    if (this.openedFileReader) { this.openedFileReader.close() }
    this.openedFileReader = new FileReader(filePath)

    await this.readFileAndRender()

    this.openedFileReader.watch(debounce(this.readFileAndRender, 200))
  }

  readFileAndRender = async () => {
    const ganttData = await this.openedFileReader.read()
    const gantt = new Gantt(ganttData)
    window.gantt = gantt

    const target = document.getElementById('render-target')
    new Render(gantt, {
      elementHeight: 20,
      dayWidth: 22
    }).render(target)
  }

  async exportButtonClickHandler (e) {
    if (!window.gantt) {
      return alert('You need to load a gantt chart yml file before exporting')
    }

    saveSvgAsPng(document.querySelector('#render-target > svg'), `${window.gantt.label}-gantt.png`, {
      backgroundColor: '#fff'
    })
  }
}
