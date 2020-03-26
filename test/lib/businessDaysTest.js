const { assert, expect } = require('chai')
const { addBusinessDays, isBusinessDay } = require('../../app/lib/businessDays')
const dayjs = require('dayjs')

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

  describe('addBusinessDays', () => {
    describe('add operation', () => {
      describe('when adding business days during a week', () => {
        it('should subtract 4 days', () => {
          const date = new Date('2020-03-16')
          expect(dayjs(addBusinessDays(date, '+', 4)).diff(date, 'days'))
            .to.equal(4)
        })

        it('should result the right date', () => {
          expect(addBusinessDays(new Date('2020-03-16'), '+', 4).toISOString())
            .to.equal('2020-03-20T00:00:00.000Z')
        })
      })
  
      describe('when adding business days during period with weekend', () => {
        it('should subtract 7 days', () => {
          const date = new Date('2020-03-16')
          expect(dayjs(addBusinessDays(date, '+', 5)).diff(date, 'days'))
            .to.equal(7)
        })

        it('should result the right date', () => {
          expect(addBusinessDays(new Date('2020-03-16'), '+', 5).toISOString())
            .to.equal('2020-03-23T00:00:00.000Z')
        })
      })

      describe('when adding business days during period with more than one weekend', () => {
        it('should subtract 16 days', () => {
          const date = new Date('2020-03-16')
          expect(dayjs(addBusinessDays(date, '+', 12)).diff(date, 'days'))
            .to.equal(16)
        })

        it('should result the right date', () => {
          expect(addBusinessDays(new Date('2020-03-16'), '+', 12).toISOString())
            .to.equal('2020-04-01T00:00:00.000Z')
        })
      })
    })

    describe('subtract operation', () => {
      describe('when subtracting business days during a week', () => {
        it('should add 4 days', () => {
          const date = new Date('2020-03-20')
          expect(dayjs(addBusinessDays(date, '-', 4)).diff(date, 'days'))
            .to.equal(-4)
        })

        it('should result the right date', () => {
          expect(addBusinessDays(new Date('2020-03-20'), '-', 4).toISOString())
            .to.equal('2020-03-16T00:00:00.000Z')
        })
      })
  
      describe('when subtracting business days during period with weekend', () => {
        it('should add 7 days', () => {
          const date = new Date('2020-03-20')
          expect(dayjs(addBusinessDays(date, '-', 5)).diff(date, 'days'))
            .to.equal(-7)
        })

        it('should result the right date', () => {
          expect(addBusinessDays(new Date('2020-03-20'), '-', 5).toISOString())
            .to.equal('2020-03-13T00:00:00.000Z')
        })
      })

      describe('when subtracting business days during period with more than one weekend', () => {
        it('should add 16 days', () => {
          const date = new Date('2020-03-20')
          expect(dayjs(addBusinessDays(date, '-', 12)).diff(date, 'days'))
            .to.equal(-16)
        })

        it('should result the right date', () => {
          expect(addBusinessDays(new Date('2020-03-20'), '-', 12).toISOString())
            .to.equal('2020-03-04T00:00:00.000Z')
        })
      })
    })
  })
})