const d3 = require("d3")
const dayjs = require('dayjs')

module.exports = class Render {
  constructor (gantt, { elementHeight, dayWidth, svgOptions }) {
    this.gantt = gantt
    this.data = this.gantt.flatItems
    
    this.elementHeight = elementHeight
    this.dayWidth = dayWidth

    this.margin = (svgOptions && svgOptions.margin) || {
      top: this.elementHeight * 2,
      left: this.elementHeight * 2
    }

    this.scaleWidth = this.scaleTotalDays * this.dayWidth
    this.scaleHeight = Math.max(200, this.data.length * this.elementHeight * 2) - (this.margin.top * 2)
    
    this.svgWidth = this.scaleWidth + (this.margin.left * 2)
    this.svgHeight = this.scaleHeight + (this.margin.top * 2)

    this.fontSize = (svgOptions && svgOptions.fontSize) || 10

    this.createScale()
    this.data = this.prepareData()
    console.log('prepared-data', this.data)
  }

  prepareData () {
    return this.data.map((item, index) => {
      const x = this.xScale(item.startDate) + 4 // TODO: adding 4 to fix scale, find out whyu
      const xEnd = this.xScale(dayjs(item.endDate).add(1, 'day').toDate()) + 4
      const y = index * this.elementHeight * 1.5
      const width = xEnd - x
      const height = this.elementHeight

      const singleCharHeight = this.fontSize * 0.45

      const label = {
        x,
        y: y + (height / 2) + singleCharHeight
      }

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
          x, xEnd, y, width, height, label
        }
      }
    })
  }

  render (target) {
    console.log('rendering gantt', this.gantt)

    const dataLength = this.data.length

    this.cleanTarget(target)
    this.createSvg(target)
    this.createContainer()
    this.createXAxys()
    this.createDependencyLines()
    this.createSectionBars()
    this.createTaskBars()
    this.createMilestoneBars()
  }

  get scaleStartDate () {
    return dayjs(this.gantt.startDate).subtract(6, 'days').toDate()
  }

  get scaleEndDate () {
    return dayjs(this.gantt.endDate).add(6, 'days').toDate()
  }

  get scaleTotalDays () {
    return dayjs(this.scaleEndDate).diff(dayjs(this.scaleStartDate), 'days')
  }

  get scaleItemWidth () {
    return this.scaleWidth / this.scaleTotalDays
  }
  
  createScale () {
    this.xScale = d3.scaleTime()
      .domain([this.scaleStartDate, this.scaleEndDate])
      .range([0, this.scaleWidth])
  }

  cleanTarget (target) {
    target.innerHTML = ''
  }

  createSvg (target, svgWidth, svgHeight) {
    this.svg = d3
      .select(target)
      .append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)
  }

  createXAxys () {
    this.xAxis = d3
      .axisBottom(this.xScale)
      .ticks(this.scaleTotalDays)
      .tickFormat(d => dayjs(d).format('DD'))

    this.container.append('g')
      .call(this.xAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line")
        .attr('y2', this.svgHeight)
        .attr('stroke', '#efefef')
      )
      .call(g => g.selectAll('.tick text')
        .attr('x', this.scaleItemWidth / 2)
      )

    this.xMonthAxis = d3
      .axisTop(this.xScale)
      .ticks(d3.timeMonth)
      .tickFormat(d => dayjs(d).format('MMMM'))

    this.container.append('g')
      .call(this.xMonthAxis)
      .call(g => g.selectAll('.tick text')
        .attr('x', 4)
        .attr('y', -4)
        .style("text-anchor", "start")
      )
  }

  createContainer () {
    this.container = this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
  }

  createDependencyLines () {
    const totalDependenciesPerItem = {}

    const dependencyLines = this.data.map((item, itemIndex) => {
      const depenedecies = Array.isArray(item.dependsOn) ? item.dependsOn : [item.dependsOn]

      return depenedecies.map(dependsOn => {
        const dependsOnItem = this.gantt.findItemById(dependsOn)
        const dependsOnIndex = this.data.findIndex(i => i.id === dependsOn)
        if(!totalDependenciesPerItem[dependsOn]) {
          totalDependenciesPerItem[dependsOn] = 1
        } else {
          totalDependenciesPerItem[dependsOn] += 1
        }

        return {
          item: item.id,
          dependsOn,
          itemStartDate: item.startDate,
          dependsOnEndDate: dependsOnItem.endDate,
          measures: {
            start: {
              x: this.xScale(dayjs(dependsOnItem.endDate).add(1, 'day').toDate()) + 4,
              y: dependsOnIndex * this.elementHeight * 1.5 + this.elementHeight / 2,
            },
            end: {
              x: this.xScale(item.startDate) + 4,
              y: itemIndex * this.elementHeight * 1.5 + this.elementHeight / 2,
            },
            dependsOnIndexForItem: totalDependenciesPerItem[dependsOn] - 1
          }
        }
      })
    }).flat()

    console.log('dependencyLines', dependencyLines)

    const polylineData = dependencyLines.map(data => {
      const color = data.measures.end.x >= data.measures.start.x ? '#aaaaaa' : '#ff0000'
      const delta = 10 + 5 * data.measures.dependsOnIndexForItem
      if (data.measures.end.x > data.measures.start.x) {
        // simple l shape
        return {
          points: [
            data.measures.start.x, data.measures.start.y,
            data.measures.start.x + delta, data.measures.start.y,
            
            data.measures.start.x + delta, data.measures.end.y,
            data.measures.end.x, data.measures.end.y
          ],
          color
        }
      } else {
        // line with go-back
        return {
          points: [
            data.measures.start.x, data.measures.start.y,
            data.measures.start.x + delta, data.measures.start.y,
            
            data.measures.start.x + delta, (data.measures.start.y + data.measures.end.y) / 2,
            data.measures.end.x - delta, (data.measures.start.y + data.measures.end.y) / 2,
  
            data.measures.end.x - delta, data.measures.end.y,
            data.measures.end.x, data.measures.end.y
          ],
          color
        }
      }
    })

    const linesContainer = this.container.append('g').attr('transform', `translate(0,${this.margin.top})`)
    linesContainer
      .selectAll('polyline')
      .data(polylineData)
      .enter()
      .append('polyline')
      .style('fill', 'none')
      .style('stroke', d => d.color)
      .attr('points', d => d.points)
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
      .attr('rx', this.elementHeight / 4)
      .attr('ry', this.elementHeight / 4)
      .attr('x', item => item.measures.x)
      .attr('y', item => item.measures.y)
      .attr('width', item => item.measures.width)
      .attr('height', item => item.measures.height)
      .style('fill', '#aeaeba')

    // task label
    bars
      .append('text')
      .style('fill', 'black')
      .style('font-family', 'sans-serif')
      .attr('x', item => item.measures.label.x + 4)
      .attr('y', item => item.measures.label.y)
      .attr('font-size', this.fontSize)
      .text(item => item.label)
  }

  createTaskBars () {
    const barsContainer = this.container.append('g').attr('transform', `translate(0,${this.margin.top})`)
    const bars = barsContainer
      .selectAll('g')
      .data(this.data.filter(item => item.type === 'task'))
      .enter()
      .append('g')

    // task bar
    bars
      .append('rect')
      .attr('x', item => item.measures.x)
      .attr('y', item => item.measures.y)
      .attr('width', item => item.measures.width)
      .attr('height', item => item.measures.height)
      .style('fill', '#bbe6ef')
      .style('stroke', '#62bdd5')

    // task progress bar
    bars
      .append('rect')
      .attr('x', item => item.measures.x)
      .attr('y', item => item.measures.y)
      .attr('width', item => item.measures.width * item.progress / 100)
      .attr('height', item => item.measures.height)
      .style('fill', '#62bdd5')

    // task label
    bars
      .append('text')
      .style('fill', 'black')
      .style('font-family', 'sans-serif')
      .attr('x', item => item.measures.label.x + 4)
      .attr('y', item => item.measures.label.y)
      .attr('font-size', this.fontSize)
      .text(item => item.label)
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

      bars
        .append('text')
        .style('fill', 'black')
        .style('font-family', 'sans-serif')
        .attr('x', item => item.measures.label.x + this.elementHeight + 4)
        .attr('y', item => item.measures.label.y)
        .attr('font-size', this.fontSize)
        .text(item => item.label)
  }
}