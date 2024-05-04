export function isImage(extension) {
  return extension == 'png' || extension == 'jpg' || extension == 'jpeg'
}

export function isDoc(extension) {
  return extension == 'doc' || extension == 'docx' || extension == 'pdf'
}

export function isPdf(extension) {
  return extension == 'pdf'
}
