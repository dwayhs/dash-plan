const Item = require('./Item')

module.exports = class Gantt extends Item {
  constructor (attributes) {
    super(attributes['gantt'])
  }
}