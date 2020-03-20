const dayjs = require('dayjs')

class Item {
  static build (attributes) {
    const type = attributes.type || 'task'

    const classes = {
      'task': Task,
      'section': Section,
      'milestone': Milestone
    }

    return new classes[type](attributes)
  }

  constructor (attributes) {

    if (attributes) {
      this._attr = attributes

      if (this._attr['id']) this.id = this._attr['id']
      if (this._attr['label']) this.label = this._attr['label']
      if (this._attr['start']) this.startDate = dayjs(this._attr['start'])
      if (this._attr['end']) this.endDate = dayjs(this._attr['end']) // TODO: calculate
      if (this._attr['duration']) this.duration = this._attr['duration'] // TODO: calculate
      if (this._attr['depends_on']) this.dependsOn = this._attr['depends_on'] // TODO: validate and 
      if (this._attr['progress']) this.progress = this._attr['progress']
      if (this._attr['items']) this.buildItems(this._attr['items'])
    }
  }

  buildItems (itemsData) {
    if (!itemsData) return

    return this.items = itemsData.map(itemData => this.buildItem(itemData))
  }

  buildItem (itemData) {
    return Item.build(itemData)
  }
}

class Task extends Item {
}

class Section extends Item {
  get startDate () {
    return Math.min(this.items.map(item => item.startDate))
  }

  get endDate () {
    return Math.max(this.items.map(item => item.endDate))
  }

  get duration () {
    //TODO: calculate based on items
  }
}

class Milestone extends Item {
}

module.exports = Item