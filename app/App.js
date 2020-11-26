const debounce = require('debounce')
const { dialog } = require('electron').remote
const FileReader = require('./service/FileReader')
const { Gantt } = require('./model/Model')
const Render = require('./render/Render')
const { saveSvgAsPng } = require('save-svg-as-png')

module.exports = class App {
  start () {
    console.log('App starting')

    this.buttons = {
      openFile: document.getElementById('openFileButton'),
      export: document.getElementById('exportButton'),
      emptyStateOpenFile: document.getElementById('emptyStateOpenFileButton'),
    }

    this.bindEventListeners()

    this.openedFilePath = null
  }

  bindEventListeners () {
    this.buttons.openFile.addEventListener('click', this.openFileButtonClickHandler)
    this.buttons.emptyStateOpenFile.addEventListener('click', this.openFileButtonClickHandler)
  
    this.buttons.export.addEventListener('click', this.exportButtonClickHandler)
  }

  openFileButtonClickHandler = async (e) => {
    const file = await dialog.showOpenDialog({ properties: ['openFile'] })
    const { filePaths } = file

    if (!filePaths.length) return

    let filePath = filePaths.pop()

    await this.openFile(filePath)
    this.enableExportButton()
  }

  openFile = async (filePath) => {
    if (this.openedFileReader) { this.openedFileReader.close() }
    this.openedFileReader = new FileReader(filePath)

    await this.readFileAndRender()

    this.openedFileReader.watch(debounce(this.readFileAndRender, 200))
  }

  enableExportButton () {
    this.buttons.export.disabled = false
  }

  readFileAndRender = async () => {
    const ganttData = await this.openedFileReader.read()
    this.gantt = new Gantt(ganttData)

    const target = document.getElementById('render-target')
    new Render(this.gantt, {
      elementHeight: 20,
      dayWidth: 22
    }).render(target)
  }

  exportButtonClickHandler = async (e) => {
    if (!this.gantt) {
      return alert('You need to load a gantt chart yml file before exporting')
    }

    saveSvgAsPng(document.querySelector('#render-target > svg'), `${this.gantt.label}-gantt.png`, {
      backgroundColor: '#fff'
    })
  }
}
