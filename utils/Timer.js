import moment from 'moment'
import 'moment-timezone'
import { padWithZero } from './Strings'
export const getTime = (seconds) => {
  let mins = parseInt(Math.floor(seconds / 60))
  let secs = seconds % 60
  return `${mins > 0 ? mins + 'm' : ''} ${secs}s`
}

export const getDate = (date) => {
  if (date) {
    let day = date.getDate()
    if (parseInt(day) < 10) {
      day = '0' + day
    }
    let month = date.getMonth() + 1
    if (parseInt(month) < 10) {
      month = '0' + month
    }
    return `${date.getFullYear()}-${month}-${day}`
  }
  return '2022-12-07'
}

export const getMonthDayYear = (date) => {
  if (date) {
    let day = date.getDate()
    if (parseInt(day) < 10) {
      day = '0' + day
    }
    let month = date.getMonth() + 1
    if (parseInt(month) < 10) {
      month = '0' + month
    }
    return `${month}.${day}.${date.getFullYear()}`
  }
  return '02-01-2024'
}

export const getDateWithZeros = (date) => {
  console.log(date,'date.........')
  if (date) {
    let month = date.getMonth() + 1
    let day = date.getDate()
    if (parseInt(month) < 10) {
      month = '0' + month
    }
    if (parseInt(day) < 10) {
      day = '0' + day
    }
    return `${date.getFullYear()}-${month}-${day}`
  }
  return '2022-12-07'
}

export const dateFormatter = (date) => {
  return date.toDateString().split(' ').slice(1).join(' ')
}

export const getHourMinutes = (date) => {
  if (date) {
    if (date.getHours() < 10 && date.getMinutes() < 10) {
      return `0${date.getHours()}:0${date.getMinutes()}`
    } else if (date.getMinutes() < 10) {
      return `${date.getHours()}:0${date.getMinutes()}`
    } else if (date.getHours() < 10) {
      return `0${date.getHours()}:${date.getMinutes()}`
    } else {
      return `${date.getHours()}:${date.getMinutes()}`
    }
  }
  return '00:00'
}

export const getTimelogHourMinutesSecond = (date) => {
  if (date) {
    if (date.getHours() < 10 && date.getMinutes() < 10) {
      return `0${date.getHours()}:0${date.getMinutes()}:00`
    } else if (date.getMinutes() < 10) {
      return `${date.getHours()}:0${date.getMinutes()}:00`
    } else if (date.getHours() < 10) {
      return `0${date.getHours()}:${date.getMinutes()}:00`
    } else {
      return `${date.getHours()}:${date.getMinutes()}:00`
    }
  }
  return '00:00:00'
}

export const getDateTime = (date) => {
  // //console.log(date, 'date...')
  if (date) {
    return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      }-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()} ${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      }:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
      }`
  }
  return '2022-12-7'
}

export const getSpiltDateTime = (date) => {
  if (date) {
    return `${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}.${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      }.${date.getFullYear()} ...`
  }
  return '2022-12-7'
}

export const extractDate = (dateTimeString) => {
  if (dateTimeString) {
    const splitDateTime = dateTimeString.split(' ')
    if (splitDateTime.length >= 1) {
      return splitDateTime[0]
    }
  }
  return ''
}

export const extractDateFormat = (dateTimeString) => {
  if (dateTimeString) {
    const splitDateTime = dateTimeString.split('T')
    if (splitDateTime.length >= 1) {
      let getDate = splitDateTime[0].split('-')
      let newDate = getDate[1] + '.' + getDate[2] + '.' + getDate[0]
      return newDate
    }
  }
  return ''
}

export const extractCustomDateFomratWithTimezone = (dateTimeString, format, timezone) => {
  //console.log(dateTimeString, 'date time string....')
  //console.log(format, 'format....')
  // if (dateTimeString) {
  //   const splitDateTime = dateTimeString.split('T')
  //   if (splitDateTime.length >= 1) {
  //     let getDate = splitDateTime[0].split('-')
  //     let newDate = getDate[1] + '.' + getDate[2] + '.' + getDate[0]
  //     return newDate
  //   }
  // }
  let originalDateTimeString = moment(dateTimeString)
  let timezoneDateTime = originalDateTimeString.tz(timezone)
  let formattedDate = timezoneDateTime.format(format)
  return formattedDate
}

export const extractDateFormatNew = (dateTimeString) => {
  let newDate = new Date(dateTimeString)
  if (newDate) {
    let getDayString = newDate.getDate() < 10 ? `0${newDate.getDate()}` : newDate.getDate()
    let getMonthString =
      newDate.getMonth() + 1 < 10 ? `0${newDate.getMonth() + 1}` : newDate.getMonth() + 1
    let getYearString = newDate.getFullYear()
    return `${getDayString}.${getMonthString}.${getYearString}`
  }
  return ''

  // //console.log(
  //   newDate.getDate(),
  //   newDate.getMonth() + 1,
  //   newDate.getFullYear(),
  //   'date time string....'
  // )
  // if (dateTimeString) {
  //   const splitDateTime = dateTimeString.split(' ')
  //   if (splitDateTime.length >= 1) {
  //     let getDate = splitDateTime[0].split('-')
  //     let newDate = getDate[1] + '.' + getDate[2] + '.' + 'getDate'[0]
  //     return newDate
  //   }
  // }
  // return ''
}

export const extractDateTimeFormatNew = (dateTimeString) => {
  let newDate = new Date(dateTimeString)
  if (newDate) {
    let getDayString = newDate.getDate() < 10 ? `0${newDate.getDate()}` : newDate.getDate()
    let getMonthString =
      newDate.getMonth() + 1 < 10 ? `0${newDate.getMonth() + 1}` : newDate.getMonth() + 1
    let getYearString = newDate.getFullYear()
    let getHourString = newDate.getHours() < 10 ? `0${newDate.getHours()}` : newDate.getHours()
    let getMinuteString =
      newDate.getMinutes() < 10 ? `0${newDate.getMinutes()}` : newDate.getMinutes()
    return `${getDayString}.${getMonthString}.${getYearString} ${getHourString}:${getMinuteString}`
  }
  return ''
}

export const extractDateFormatDots = (dateTime) => {
  //console.log(dateTime)
  if (dateTime) {
    let newDateTime
    let month, day
    if (dateTime.getMonth() + 1 < 10) {
      month = `0${dateTime.getMonth() + 1}`
    } else {
      month = dateTime.getMonth() + 1
    }

    if (dateTime.getDate() < 10) {
      day = `0${dateTime.getDate()}`
    } else {
      day = dateTime.getDate()
    }

    return month + '.' + day + '.' + dateTime.getFullYear()
  }
  return ''
}

export const extractDateTimeFormat = (dateTimeString) => {
  if (dateTimeString) {
    const splitDateTime = dateTimeString.split(' ')
    if (splitDateTime.length >= 1) {
      let getDate = splitDateTime[0].split('-')
      let getTime = splitDateTime[1].split(':')
      let newDate =
        getDate[1] + '.' + getDate[2] + '.' + getDate[0] + ' ' + getTime[0] + ':' + getTime[1]
      return newDate
    }
  }
  return ''
}

export const jsCoreDateCreator = (dateString) => {
  // dateString *HAS* to be in this format "YYYY-MM-DD HH:MM:SS"
  // //console.log(dateString, 'date string....')
  if (dateString.includes('T')) {
    dateString = dateString.replace('T', ' ')
  }
  if (dateString.includes('Z')) {
    dateString = dateString.replace('Z', '')
  }
  let dateParam = dateString.split(/[\s-:]/)
  dateParam[1] = (parseInt(dateParam[1], 10) - 1).toString()
  // //console.log(dateParam, 'date param....')
  return new Date(...dateParam)
}

export const timeStampToDate = (timestamp) => {
  let dateString = '1970-01-01 ' + timestamp
  const date = jsCoreDateCreator(dateString)
  return date
}

export const getAllMonths = (date = null, nYear = null) => {
  // const date = new Date()
  let year
  if (date) {
    year = date.getUTCFullYear()
  } else if (nYear) {
    year = nYear
  }

  const months = [
    { name: 'January', number: 1, current: `${year}-01-01` },
    { name: 'February', number: 2, current: `${year}-02-01` },
    { name: 'March', number: 3, current: `${year}-03-01` },
    { name: 'April', number: 4, current: `${year}-04-01` },
    { name: 'May', number: 5, current: `${year}-05-01` },
    { name: 'June', number: 6, current: `${year}-06-01` },
    { name: 'July', number: 7, current: `${year}-07-01` },
    { name: 'August', number: 8, current: `${year}-08-01` },
    { name: 'September', number: 9, current: `${year}-09-01` },
    { name: 'October', number: 10, current: `${year}-10-01` },
    { name: 'November', number: 11, current: `${year}-11-01` },
    { name: 'December', number: 12, current: `${year}-12-01` },
  ]
  return months
}

export const getSingleMonth = (date) => {
  const month = JSON.stringify(date).split('T')[0].split('"')[1]
  return month
}

export const getDayOnly = (date) => {
  let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[date.getDay()]
}

export const getYearMonthDayDateFromDateObj = (date, day = false, comma = true) => {
  let days = ['Su.', 'Mo.', 'Tu.', 'We.', 'Th.', 'Fr.', 'Sa.']
  let text = ''
  if (date) {
    if (day) {
      if (comma) {
        text = getAllMonths(date)[date.getMonth()]?.name + ', ' + date.getDate()
      } else {
        text = getAllMonths(date)[date.getMonth()]?.name + ' ' + date.getDate()
      }
    } else {
      text =
        getAllMonths(date)[date.getMonth()].current.split('-')[0] +
        ' ' +
        getAllMonths(date)[date.getMonth()].name +
        ', ' +
        days[date.getDay()] +
        ' ' +
        date.getDate()
    }
  }
  return text
}

export const getYearMonthDateRangeFromDateObj = (date1, date2 = null) => {
  let today = new Date()
  let date1date = date1.getDate()
  let date2date = date2
    ? date2.getDate()
    : Math.min(today.getDate() + 6, getMonthDay(today.getMonth() + 1))

  let text = ''
  let text2 = ''
  if (date1) {
    text =
      getAllMonths(date1)[date1.getMonth()].current.split('-')[0] +
      ' ' +
      getAllMonths(date1)[date1.getMonth()].name +
      ', ' +
      date1date +
      '-' +
      date2date

    text2 =
      getAllMonths(date1)[date1.getMonth()].current.split('-')[0] +
      '-' +
      getAllMonths(date1)[date1.getMonth()].number +
      ',' +
      date1date +
      '-' +
      date2date
  }
  return [text, text2]
}

export const getWeekDates = (date) => {
  const days = ['Su.', 'Mo.', 'Tu.', 'We.', 'Th.', 'Fr.', 'Sa.']
  let day = days.indexOf(days[date.getDay()])
  const weekDates = []
  for (let i = day; i >= 0; i--) {
    const newDate = new Date(date)
    newDate.setDate(date.getDate() + 1 - i)
    weekDates.push(newDate)
  }
  for (let i = 1; i < 7 - day; i++) {
    const newDate = new Date(date)
    newDate.setDate(date.getDate() + 1 + i)
    weekDates.push(newDate)
  }
  return weekDates
}

export const getDateOnly = (date) => {
  let dateString = date.toISOString().split('T')[0].split('-')[2]
  return dateString
}

export const getDateRangeArray = (startDate, endDate) => {
  let dateArray = []
  let currentDate = JSON.stringify(startDate).split('T')[0].split('"')[1]
  let end = JSON.stringify(endDate).split('T')[0].split('"')[1]
  let index1 = parseInt(currentDate.split('-')[2])
  let index2 = parseInt(end.split('-')[2])
  for (let i = index1; i <= index2; i++) {
    if (currentDate.split('-')[2].startsWith('0')) {
      let newstr =
        currentDate.split('-')[0] + '-' + currentDate.split('-')[1] + '-' + '0' + i.toString()
      dateArray.push(newstr)
    } else {
      let newstr = currentDate.split('-')[0] + '-' + currentDate.split('-')[1] + '-' + i.toString()
      dateArray.push(newstr)
    }
  }

  return dateArray
}

export const getDateRangeArrayFromRange = (startDate, endDate, range) => {
  let dateArray = []
  let strDate =
    startDate.toString().length === 1 ? '0' + startDate.toString() : startDate.toString()
  let dateString = range.split(',')[0]
  if (dateString.split('-')[1].length === 1) {
    dateString = dateString.split('-')[0] + '-' + '0' + dateString.split('-')[1] + '-' + strDate
  }

  for (let i = startDate; i <= endDate; i++) {
    if (i.toString().length === 1) {
      let newstr =
        dateString.split('-')[0] + '-' + dateString.split('-')[1] + '-' + '0' + i.toString()
      dateArray.push(newstr)
    } else {
      let newstr = dateString.split('-')[0] + '-' + dateString.split('-')[1] + '-' + i.toString()
      dateArray.push(newstr)
    }
  }
  return dateArray
}

export const getMonthDay = (month) => {
  const months = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31,
  }
  return months[month]
}

export function generateNewRange(range) {
  // 2023-8,17-23 this is the format for range
  let yearMonth = range.split(',')[0] // 2023-8
  let year = parseInt(yearMonth.split('-')[0]) // 2023
  let month = parseInt(yearMonth.split('-')[1]) // 8

  let startEnd = range.split(',')[1] // 17-23
  let prevEndDateDay = parseInt(startEnd.split('-')[1]) // 23

  let prevEndDate = moment.utc(`${year}-${padWithZero(month)}-${padWithZero(prevEndDateDay)}`)
  let prevEndDateCopy = moment.utc(`${year}-${padWithZero(month)}-${padWithZero(prevEndDateDay)}`) // used for

  prevEndDate.add(1, 'day') // new start date
  prevEndDateCopy.add(7, 'days') // new start date

  let newStartMonth = prevEndDate.format('M')
  let newStartDate = prevEndDate.format('D')
  let newStartYear = prevEndDate.format('YYYY')

  let newEndMonth = prevEndDateCopy.format('M')
  let newEndDate = prevEndDateCopy.format('D')

  if (newStartMonth != newEndMonth) {
    newEndDate = getMonthDay(newStartMonth)
  }

  let newRange = `${newStartYear}-${newStartMonth},${newStartDate}-${newEndDate}`
  return { newRange, startDate: parseInt(newStartDate), endDate: parseInt(newEndDate) }
}

export function generateNewRangeBackwards(range) {
  // 2023-8,17-23 this is the format for range
  let yearMonth = range.split(',')[0] // 2023-8
  let year = parseInt(yearMonth.split('-')[0]) // 2023
  let month = parseInt(yearMonth.split('-')[1]) // 8

  let startEnd = range.split(',')[1] // 17-23
  let prevStartDateDay = parseInt(startEnd.split('-')[0]) // 17

  let prevStartDate = moment.utc(`${year}-${padWithZero(month)}-${padWithZero(prevStartDateDay)}`)
  let prevStartDateCopy = moment.utc(
    `${year}-${padWithZero(month)}-${padWithZero(prevStartDateDay)}`
  ) // used for

  prevStartDate.subtract(1, 'day') // new end date
  prevStartDateCopy.subtract(7, 'days') // new start date

  let newEndMonth = prevStartDate.format('M')
  let newEndDate = prevStartDate.format('D')
  let newEndYear = prevStartDate.format('YYYY')

  let newStartMonth = prevStartDateCopy.format('M')
  let newStartDate = prevStartDateCopy.format('D')

  if (newStartMonth != newEndMonth) {
    newStartDate = 1
  }

  let newRange = `${newEndYear}-${newEndMonth},${newStartDate}-${newEndDate}`
  return { newRange, startDate: parseInt(newStartDate), endDate: parseInt(newEndDate) }
}

export function generateInitialRange(dateAsString) {
  // //console.log(dateAsString, 'dateAsString')
  // 2023-8-17 is the format
  let splitArr = dateAsString.split('-')
  let year = splitArr[0]
  let month = splitArr[1]
  let startDate = splitArr[2]
  let endDate = parseInt(Math.min(parseInt(startDate) + 6, getMonthDay(parseInt(month))))
  let range = `${year}-${month},${startDate}-${endDate}`
  return { range, startDate, endDate }
}

export const getMonth = (date) => {
  const monthList = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'July',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return monthList[date.getMonth()]
}

export const getMonthAllDays = (date, item) => {
  const weekdays = ['Su.', 'Mo.', 'Tu.', 'We.', 'Th.', 'Fr.', 'Sa.']
  const day = date.getDay()
  let monthIndex = parseInt(item.split('-')[1])
  let firstDay = parseInt(item.split('-')[2])
  let lastDay = getMonthDay(monthIndex)
  let days = []
  for (let i = 0; i < day; i++) {
    days.push('')
  }
  for (let i = firstDay; i <= lastDay; i++) {
    days.push(i)
  }
  return days
}

export const allMonthsOfThreeYear = (date = null, nYear = null) => {
  let year
  if (date) {
    year = date.getUTCFullYear()
  } else if (nYear) {
    year = nYear
  }

  const months = [
    `${year}-01-01`,
    `${year}-02-01`,
    `${year}-03-01`,
    `${year}-04-01`,
    `${year}-05-01`,
    `${year}-06-01`,
    `${year}-07-01`,
    `${year}-08-01`,
    `${year}-09-01`,
    `${year}-10-01`,
    `${year}-11-01`,
    `${year}-12-01`,
    `${parseInt(year) + 1}-01-01`,
    `${parseInt(year) + 1}-02-01`,
    `${parseInt(year) + 1}-03-01`,
    `${parseInt(year) + 1}-04-01`,
    `${parseInt(year) + 1}-05-01`,
    `${parseInt(year) + 1}-06-01`,
    `${parseInt(year) + 1}-07-01`,
    `${parseInt(year) + 1}-08-01`,
    `${parseInt(year) + 1}-09-01`,
    `${parseInt(year) + 1}-10-01`,
    `${parseInt(year) + 1}-11-01`,
    `${parseInt(year) + 1}-12-01`,
    `${parseInt(year) + 2}-01-01`,
    `${parseInt(year) + 2}-02-01`,
    `${parseInt(year) + 2}-03-01`,
    `${parseInt(year) + 2}-04-01`,
    `${parseInt(year) + 2}-05-01`,
    `${parseInt(year) + 2}-06-01`,
    `${parseInt(year) + 2}-07-01`,
    `${parseInt(year) + 2}-08-01`,
    `${parseInt(year) + 2}-09-01`,
    `${parseInt(year) + 2}-10-01`,
    `${parseInt(year) + 2}-11-01`,
    `${parseInt(year) + 2}-12-01`,
    `${parseInt(year) + 3}-01-01`,
    `${parseInt(year) + 3}-02-01`,
    `${parseInt(year) + 3}-03-01`,
    `${parseInt(year) + 3}-04-01`,
    `${parseInt(year) + 3}-05-01`,
    `${parseInt(year) + 3}-06-01`,
    `${parseInt(year) + 3}-07-01`,
    `${parseInt(year) + 3}-08-01`,
    `${parseInt(year) + 3}-09-01`,
    `${parseInt(year) + 3}-10-01`,
    `${parseInt(year) + 3}-11-01`,
    `${parseInt(year) + 3}-12-01`,
  ]
  return months
}

export const getAllMonthsOfYear = (date = null, nYear = null) => {
  // const date = new Date()
  let year
  if (date) {
    year = date.getUTCFullYear()
  } else if (nYear) {
    year = nYear
  }

  const months = [
    `${year}-01-01`,
    `${year}-02-01`,
    `${year}-03-01`,
    `${year}-04-01`,
    `${year}-05-01`,
    `${year}-06-01`,
    `${year}-07-01`,
    `${year}-08-01`,
    `${year}-09-01`,
    `${year}-10-01`,
    `${year}-11-01`,
    `${year}-12-01`,
  ]

  return months
}

export const getThreeYearsMonths = (date = null, nYear = null) => {
  let year
  if (date) {
    year = date.getUTCFullYear()
  } else if (nYear) {
    year = nYear
  }

  const months = [
    `${year}-01-01`,
    `${year}-02-01`,
    `${year}-03-01`,
    `${year}-04-01`,
    `${year}-05-01`,
    `${year}-06-01`,
    `${year}-07-01`,
    `${year}-08-01`,
    `${year}-09-01`,
    `${year}-10-01`,
    `${year}-11-01`,
    `${year}-12-01`,
    `${parseInt(year) + 1}-01-01`,
    `${parseInt(year) + 1}-02-01`,
    `${parseInt(year) + 1}-03-01`,
    `${parseInt(year) + 1}-04-01`,
    `${parseInt(year) + 1}-05-01`,
    `${parseInt(year) + 1}-06-01`,
    `${parseInt(year) + 1}-07-01`,
    `${parseInt(year) + 1}-08-01`,
    `${parseInt(year) + 1}-09-01`,
    `${parseInt(year) + 1}-10-01`,
    `${parseInt(year) + 1}-11-01`,
    `${parseInt(year) + 1}-12-01`,
  ]
  return months
}

export const getThreeYears = (date = null, nYear = null) => {
  let year
  if (date) {
    year = date.getUTCFullYear()
  } else if (nYear) {
    year = nYear
  }
  let years = [year, parseInt(year) + 1]
  // for (let i = 1; i <= 5; i++) {
  //   years = [parseInt(year) - i, ...years, parseInt(year) + i]
  // }
  return years
}

export const secondToDhms = (seconds) => {
  seconds = Number(seconds)
  let w = Math.floor(seconds / (3600 * 24 * 7))
  let d = Math.floor(seconds / (3600 * 24))
  let h = Math.floor(seconds / 3600)
  let m = Math.floor((seconds % 3600) / 60)
  let s = Math.floor((seconds % 3600) % 60)

  let wDisplay = w > 0 ? d + 'w ' : ''
  let dDisplay = d > 0 ? d + 'd ' : ''
  let hDisplay = h > 0 ? h + 'h ' : ''
  let mDisplay = m > 0 ? m + 'm ' : ''
  let sDisplay = s > 0 ? s + 's ' : ''
  return wDisplay + dDisplay + hDisplay + mDisplay + sDisplay
}

export const secondtoHms = (seconds) => {
  seconds = Number(seconds)

  let h = Math.floor(seconds / 3600)
  let m = Math.floor((seconds % 3600) / 60)
  let s = Math.floor((seconds % 3600) % 60)

  let hDisplay = h > 0 ? (h < 10 ? '0' + h + 'h:' : h + 'h:') : '00h:'
  let mDisplay = m > 0 ? (m < 10 ? '0' + m + 'm:' : m + 'm:') : '00m:'
  let sDisplay = s > 0 ? (s < 10 ? '0' + s + 's' : s + 's') : '00s'
  return hDisplay + mDisplay + sDisplay
}

export const statusBarSecondtoHms = (seconds) => {
  seconds = Number(seconds)

  let h = Math.floor(seconds / 3600)
  let m = Math.floor((seconds % 3600) / 60)
  let s = Math.floor((seconds % 3600) % 60)

  let hDisplay = h > 0 ? (h < 10 ? '0' + h + ':' : h + ':') : '00:'
  let mDisplay = m > 0 ? (m < 10 ? '0' + m + ':' : m + ':') : h === 0 && m === 0 ? '00:':'00'
  let sDisplay = s > 0 ? (s < 10 ? '0' + s  : s) : "00"
  return hDisplay + mDisplay + sDisplay
}



export const secondtoHm = (seconds) => {
  seconds = Number(seconds)

  //console.log('seconds.....', seconds)

  let h = Math.floor(seconds / 3600)
  let m = Math.floor((seconds % 3600) / 60)

  let hDisplay = h > 0 ? h : '0:'
  let mDisplay = m > 0 ? m : '0'

  //console.log(h, m, 'hour and minute ...')

  if (!m && !h) {
    return `0:0`
  } else if (m && !h) {
    return `0:${m}`
  } else {
    return `${h}:${m}`
  }
}


function formatTime(hours, second) {
  const absoluteHours = Math.floor(hours);
  const minutes = Math.floor((hours - absoluteHours) * 60);
  const seconds = Math.floor(((hours - absoluteHours) * 60 - minutes) * 60);
  let formattedTime;
  if (second) {
    formattedTime = `${absoluteHours < 10 ? '0' + absoluteHours : absoluteHours}h:${minutes < 10 ? '0' + minutes : minutes}m:${seconds < 10 ? '0' + seconds : seconds}s`;
  } else {
    formattedTime = `${absoluteHours < 10 ? '0' + absoluteHours : absoluteHours}:${minutes < 10 ? '0' + minutes : minutes}:00`;
  }
  return formattedTime;
}

export const findTimeDifference = (start, end, seconds = false) => {
  const timeDifference = Math.abs(end - start);
  const hoursDifference = timeDifference / (1000 * 60 * 60);
  const formattedTimeDifference = formatTime(hoursDifference, seconds);
  console.log(formattedTimeDifference,'formatted time difference.....')
  return formattedTimeDifference;
}