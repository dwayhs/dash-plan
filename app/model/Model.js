const dayjs = require('dayjs')
const minMax = require('dayjs/plugin/minMax')
dayjs.extend(minMax)

class Item {
  static build (attributes, gantt) {
    const type = attributes.type || 'task'

    const classes = {
      'task': Task,
      'section': Section,
      'milestone': Milestone
    }

    return new classes[type](attributes, gantt)
  }

  constructor (attributes, gantt) {
    this._gantt = gantt || this
    if (attributes) this._attr = attributes
  }

  get id () {
    return this._attr['id']
  }

  get label () {
    return this._attr['label'] || 'missing label' 
  }

  get startDate () {
    const startDate = dayjs(this._attr['start'])
    if (startDate.isValid()) return startDate.toDate()

    return this.calculateStartDate()
  }

  get endDate () {
    if (this._attr['end']) {
      return dayjs(this._attr['end']).toDate()
    }

    if (this._attr['duration']) {
      return this.applyDuration(this.startDate, this._attr['duration'])
    }

    throw Error(`You need to have at least end or duration specified for this item: ${this.label}`)
  }

  get duration () {
    if (this._attr['duration']) {
      return this._attr['duration']
    }

    if (this.startDate && this.endDate) {
      return dayjs(this.endDate).diff(dayjs(this.startDate), 'days') + 'd'
    }

    throw Error(`You need to have at least end or duration specified for this item: ${this.label}`)
  }

  get dependsOn () {
    return this._attr['depends_on'] || []
  }

  get progress () {
     return this._attr['progress'] || 0
  }

  get items () {
    if (!this._attr['items']) return []

    return this._attr['items'].map(itemData => Item.build(itemData, this._gantt))
  }

  get flat () {
    return [
      this,
      this.flatItems,
    ].flat()
  }

  get flatItems () {
    return this.items.map(item => item.flat).flat()
  }

  parseDuration (duration) {
    const [ _, operation, value, unit ] = duration.match(/([+-]?)(\d)([dmy])/)
    const unitTranslation = {
      d: 'day',
      m: 'month',
      y: 'year'
    }

    return {
      value: parseInt(value),
      operation: operation || '+',
      unit: unitTranslation[unit]
    }
  }

  applyDuration (date, duration) {
    if (!duration) return date

    const { operation, value, unit } = this.parseDuration(duration)
    if (operation === '+') {
      return dayjs(date).add(value, unit).toDate()
    } else {
      return dayjs(date).subtract(value, unit).toDate()
    }
  }

  calculateStartDate () {
    const match = this._attr['start']
      .replace(/ /g,'') // remove all empty spaces
      .match(/after\((\d)\)([+-]\d[dmy])?/)

    if (!match) throw Error(`Invalid date expression: ${this._attr['start']}`)

    const [ _, refId, duration ] = match
    const referencedItem = this._gantt.findItemById(refId)
    return this.applyDuration(referencedItem.endDate, duration)
  }

  findItemById (id) {
    return this.flatItems.filter(item => `${item.id}` === `${id}`)[0]
  }
}

class Container extends Item {
  get startDate () {
    let startDate
    try {
      let startDate = super.startDate()
    }
    finally {
      return startDate || dayjs.min(this.flatItems.map(item => dayjs(item.startDate))).toDate()
    }
  }

  get endDate () {
    let endDate
    try {
      let endDate = super.endDate()
    }
    finally {
      return endDate || dayjs.max(this.flatItems.map(item => dayjs(item.endDate))).toDate()
    }
  }
}

class Gantt extends Container {
  constructor (attributes) {
    super(attributes['gantt'])
  }
}

class Section extends Container {
  get type () {
    return 'section'
  }
}

class Task extends Item {
  get type () {
    return 'task'
  }
}

class Milestone extends Item {
  get type () {
    return 'milestone'
  }

  get endDate () {
    return this.startDate
  }

  get duration () {
    return '0d'
  }
}


module.exports = { Gantt, Section, Task, Milestone }
