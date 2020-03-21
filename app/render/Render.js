const d3 = require("d3")

module.exports = class Render {
  constructor (gantt, { elementHeight, svgOptions }) {
    this.gantt = gantt
    this.data = this.gantt.flatItems
    
    this.elementHeight = elementHeight

    this.margin = (svgOptions && svgOptions.margin) || {
      top: this.elementHeight * 2,
      left: this.elementHeight * 2
    }
    this.scaleWidth = ((svgOptions && svgOptions.width) || 600) - (this.margin.left * 2)
    this.scaleHeight = Math.max((svgOptions && svgOptions.height) || 200, this.data.length * this.elementHeight * 2) - (this.margin.top * 2)
    
    this.svgWidth = this.scaleWidth + (this.margin.left * 2)
    this.svgHeight = this.scaleHeight + (this.margin.top * 2)

    this.fontSize = (svgOptions && svgOptions.fontSize) || 12

    this.createScale()
    this.data = this.prepareData()
    console.log('prepared-data', this.data)
  }

  prepareData () {
    return this.data.map((item, index) => {
      const x = this.xScale(item.startDate)
      const xEnd = this.xScale(item.endDate)
      const y = index * this.elementHeight * 1.5
      const width = xEnd - x
      const height = this.elementHeight

      return {
        type: item.type,
        id: item.id,
        label: item.label,
        startDate: item.startDate,
        endDate: item.endDate,
        duration: item.duration,
        dependsOn: item.dependsOn,
        progress: item.progress,
        measures: {
          x, xEnd, y, width, height
        }
      }
    })
  }

  render (target) {
    console.log('rendering gantt', this.gantt)

    const dataLength = this.data.length

    this.createSvg(target)
    this.createContainer()
    this.createXAxys()
    
    // this.linesContainer = this.container.append('g').attr('transform', `translate(0,${this.margin.top})`)

    this.createSectionBars()
    this.createTaskBars()
    this.createMilestoneBars()

    this.container.append('g').call(this.xAxis)
  }

  createScale () {
    this.xScale = d3.scaleTime()
      .domain([this.gantt.startDate, this.gantt.endDate])
      .range([0, this.scaleWidth])
  }

  createSvg (target, svgWidth, svgHeight) {
    this.svg = d3
      .select(target)
      .append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)
  }

  createXAxys () {
    this.xAxis = d3.axisBottom(this.xScale)
  }

  createContainer () {
    this.container = this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
  }

  createSectionBars () {
    const barsContainer = this.container.append('g').attr('transform', `translate(0,${this.margin.top})`)
    const bars = barsContainer
      .selectAll('g')
      .data(this.data.filter(item => item.type === 'section'))
      .enter()
      .append('g')

    bars
      .append('rect')
      .attr('rx', this.elementHeight / 2)
      .attr('ry', this.elementHeight / 2)
      .attr('x', item => item.measures.x)
      .attr('y', item => item.measures.y)
      .attr('width', item => item.measures.width)
      .attr('height', item => item.measures.height)
      .style('fill', '#aeaeba')
  }

  createTaskBars () {
    const barsContainer = this.container.append('g').attr('transform', `translate(0,${this.margin.top})`)
    const bars = barsContainer
      .selectAll('g')
      .data(this.data.filter(item => item.type === 'task'))
      .enter()
      .append('g')

    bars
      .append('rect')
      .attr('rx', this.elementHeight / 8)
      .attr('ry', this.elementHeight / 8)
      .attr('x', item => item.measures.x)
      .attr('y', item => item.measures.y)
      .attr('width', item => item.measures.width)
      .attr('height', item => item.measures.height)
      .style('fill', '#bbe6ef')
      .style('stroke', '#62bdd5')
  }

  createMilestoneBars () {
    const barsContainer = this.container.append('g').attr('transform', `translate(0,${this.margin.top})`)
    const bars = barsContainer
      .selectAll('g')
      .data(this.data.filter(item => item.type === 'milestone'))
      .enter()
      .append('g')

    bars
      .append('path')
      .attr('d', `M 0 ${this.elementHeight/2} L ${this.elementHeight/2} ${this.elementHeight} ${this.elementHeight} ${this.elementHeight/2} ${this.elementHeight/2} 0 Z`)
      .attr('transform', item => `translate(${item.measures.x},${item.measures.y})`)
      .style('fill', '#ffe0b2')
      .style('stroke', '#fba22c')
  }
}