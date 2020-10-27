const { dialog } = require('electron').remote
const FileReader = require('./service/FileReader')
const { Gantt } = require('./model/Model')
const Render = require('./render/Render')
const { saveSvgAsPng } = require('save-svg-as-png')

module.exports = class App {
  start () {
    console.log('App starting')
    this.bindEventListeners()
  }

  bindEventListeners () {
    document.getElementById('selectFileButton').addEventListener('click', this.selectFileButtonClickHandler)
    document.getElementById('exportButton').addEventListener('click', this.exportButtonClickHandler)
  }

  async selectFileButtonClickHandler (e) {
    const file = await dialog.showOpenDialog({ properties: ['openFile'] })
    const { filePaths } = file

    if (!filePaths.length) return

    const filePath = filePaths.pop()
    console.log('filePath', filePath)

    const fileReader = new FileReader(filePath)
    const ganttData = await fileReader.read()
    const gantt = new Gantt(ganttData)
    window.gantt = gantt

    const target = document.getElementById('render-target')
    new Render(gantt, {
      elementHeight: 20,
      dayWidth: 22,
    }).render(target)
  }

  async exportButtonClickHandler (e) {
    if (!window.gantt) {
      return alert('You need to load a gantt chart yml file before exporting')
    }

    saveSvgAsPng(document.querySelector('#render-target > svg'), `${window.gantt.label}-gantt.png`, {
      backgroundColor: '#fff',
    })
  }
}