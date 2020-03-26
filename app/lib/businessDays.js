const dayjs = require('dayjs')

function addBusinessDays (date, operation, days) {
  let daysToApply = days
  let currentDate = dayjs(date)
  while (daysToApply > 0) {
    currentDate = operation === '+' ? currentDate.add(1, 'day') : currentDate.subtract(1, 'day')
    if (isBusinessDay(currentDate)) {
      daysToApply -= 1
    }
  }

  return currentDate.toDate()
}

function isBusinessDay (date)  {
  // TODO: allow customization of business days
  return [0, 1, 2, 3, 4].includes(dayjs(date).day())
}


module.exports = {
  addBusinessDays,
  isBusinessDay
}

// addBusinessDays(dayjs('2020-03-25').toDate(), '+', 4 - 1).toISOString()