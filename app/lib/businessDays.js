const dayjs = require('dayjs')
process.env.TZ = 'Etc/UTC'

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

function isBusinessDay (date) {
  // TODO: allow customization of business days
  return [1, 2, 3, 4, 5].includes(dayjs(date).locale('en').day())
}

module.exports = {
  addBusinessDays,
  isBusinessDay
}
