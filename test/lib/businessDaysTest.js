const { assert } = require('chai')
const { addBusinessDays, isBusinessDay } = require('../../app/lib/businessDays')

describe('BusinessDays', () => {
  describe('isBusinessDays', () => {
    it('should return `true` if day is monday', () => {
      assert.isTrue(isBusinessDay(new Date('2020-01-06')))
    })

    it('should return `true` if day is tuesday', () => {
      assert.isTrue(isBusinessDay(new Date('2020-01-07')))
    })

    it('should return `true` if day is wednesday', () => {
      assert.isTrue(isBusinessDay(new Date('2020-01-08')))
    })

    it('should return `true` if day is thursday', () => {
      assert.isTrue(isBusinessDay(new Date('2020-01-09')))
    })

    it('should return `true` if day is friday', () => {
      assert.isTrue(isBusinessDay(new Date('2020-01-10')))
    })

    it('should return `false` if day is saturday', () => {
      assert.isFalse(isBusinessDay(new Date('2020-01-11')))
    })

    it('should return `false` if day is sunday', () => {
      assert.isFalse(isBusinessDay(new Date('2020-01-12')))
    })
  })
})