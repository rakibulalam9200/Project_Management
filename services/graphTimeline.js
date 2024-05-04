import moment from 'moment-mini'

import { dateFormat } from '../assets/constants/date'
function generateDates({ type, currentDate, startDate, endDate }) {
  let result

  switch (type) {
    case 'months':
      result = generateForMonth({ currentDate, startDate, endDate })
      break
    case 'weeks':
      result = generateForWeek({ currentDate, startDate, endDate })
      break
    case 'days':
      result = generateForDay({ currentDate, startDate, endDate })
      break
  }

  return result
}

function generateForMonth({ currentDate, startDate, endDate }) {
  const arr = []
  let keyString = ''
  if (!startDate) { startDate = moment(currentDate, 'MMMM').subtract(6, 'months').format(dateFormat) }

  if (!endDate) { endDate = moment(currentDate, 'MMMM').add(6, 'months').format(dateFormat) }

  const diff = moment(endDate, dateFormat).diff(moment(startDate, dateFormat), 'months')
  for (let i = 0; i <= diff; i++) {
    keyString = moment(startDate, dateFormat).add(i, 'months').format(dateFormat)
    arr.push({
      value: moment(startDate, dateFormat).add(i, 'months').format('MMM YYYY'),
      key: keyString,
    })
  }

  return { start: startDate, end: endDate, dates: arr }
}

function generateForWeek({ currentDate, startDate, endDate }) {
  let weekStart = null
  let weekEnd = null
  const arr = []
  if (!startDate) { startDate = moment(currentDate, dateFormat).subtract(6, 'weeks').format(dateFormat) }

  if (!endDate) { endDate = moment(currentDate, dateFormat).add(6, 'weeks').format(dateFormat) }

  const diff = moment(endDate, dateFormat).diff(moment(startDate, dateFormat), 'weeks')
  for (let i = 0; i <= diff; i++) {
    let resultString = ''
    let keyString = ''
    weekStart = moment(startDate, dateFormat).add(i, 'weeks').format(dateFormat)
    weekEnd = moment(startDate, dateFormat)
      .subtract(1, 'days')
      .add(i + 1, 'weeks')
      .format(dateFormat)

    keyString = `${moment(weekStart, dateFormat).add(i, 'weeks').format(dateFormat)} - ${moment(
      weekEnd,
      dateFormat
    )
      .add(i + 1, 'weeks')
      .format(dateFormat)}`
    resultString += `${moment(weekStart, dateFormat).format('D')}-${moment(
      weekEnd,
      dateFormat
    ).format('D')}
`

    if (
      moment(weekStart, dateFormat).format('MMMM') !== moment(weekEnd, dateFormat).format('MMMM')
    ) {
      resultString += `${moment(weekStart, dateFormat).format('MMM')}-${moment(
        weekEnd,
        dateFormat
      ).format('MMM')}`
    } else { resultString += moment(weekStart, dateFormat).format('MMM') }

    arr.push({ value: resultString, key: keyString })
  }

  return { start: startDate, end: endDate, dates: arr }
}

function generateForDay({ currentDate, startDate, endDate }) {
  const arr = []
  if (!startDate) { startDate = moment(currentDate, dateFormat).subtract(6, 'days').format(dateFormat) }
  else { startDate = moment(startDate, dateFormat) }

  if (!endDate) { endDate = moment(currentDate, dateFormat).add(6, 'days').format(dateFormat) }
  else { endDate = moment(endDate, dateFormat) }

  const diff = moment(endDate, dateFormat).diff(moment(startDate, dateFormat), 'days')

  for (let i = 0; i <= diff; i++) {
    let resultString = ''
    let keyString
    keyString = `${moment(startDate, dateFormat).add(i, 'days').format(dateFormat)}`
    resultString += `${moment(startDate, dateFormat).add(i, 'days').format('D')}
${moment(startDate, dateFormat).add(i, 'days').format('MMMM')}`

    arr.push({ value: resultString, key: keyString })
  }

  return { start: startDate, end: endDate, dates: arr }
}

export default generateDates
