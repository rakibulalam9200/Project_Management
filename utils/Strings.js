export const abbreviateString = (str, max_chars = 11) => {
  if (!str) return ''
  if (str?.length > max_chars) {
    return str.slice(0, max_chars + 1) + '...'
  }
  return str
}

export const objectToArray = (obj) => {
  let array = []
  if (obj) {
    for (let key in obj) {
      array.push({ [key]: obj[key] })
    }
  }
  return array
}
export const getFirstKey = (obj) => {
  for (let key in obj) {
    return key
  }
  return ''
}

export function getInitialNameLetters(name) {
  return name
    .split(' ')
    .map((word) => (word.length > 0 ? word[0] : '')) //
    .join('')
    .slice(0, 2)
}

export function padWithZero(num) {
  if (num < 10) return '0' + num
  else return num
}


export function extractStringFromHtmlTag(str) {
  //console.log('str', str)
  let string = str.replace(/<\/?[^>]+(>|$)/g, '')
  string = string.replace(/&nbsp;/g, ' ')
  return string
}