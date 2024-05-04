export function capitalizeFirstLetter(string) {
  if (!string) return null
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function getFirstLetter(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase()
}
