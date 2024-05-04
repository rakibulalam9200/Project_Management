// returns an object containing all attachment as an array index that is suitable for sending with axios
export const getAttachmentsFromDocuments = (documents) => {
  if (!documents) return {}
  let attachments = {}
  for (let i = 0; i < documents.length; i++) {
    let document = documents[i]
    if (document?.sound) {
      attachments[`attachments[${i}]`] = {
        type: 'audio/m4a',
        mimeType: 'audio/m4a',
        uri: document.file,
        name: `${document.duration}-sound.m4a`,
        // duration: document.duration,
      }
    } else {
      attachments[`attachments[${i}]`] = {
        ...document,
        type: document.mimeType,
      }
    }
  }

  console.log(attachments,'#######attachment############')
  return attachments
}

export const getMultipleAttachmentsFromDocuments = (documents) => {
  if (!documents) return {}
  let attachments = {}
  for (let i = 0; i < documents.length; i++) {
    let document = documents[i]

    if(document?.mime){
      attachments[`attachments[${i}]`] = {
        ...document,
        name: document?.filename,
        uri: document?.fileCopyUri || ("file://" + document?.path),
        type: "image/*"
      }
    }else if(document?.mimeType){
      attachments[`attachments[${i}]`] = {
        ...document,
        name: document?.name,
        uri: document?.uri,
        type: "image/*"
      }
    } else{
      attachments[`attachments[${i}]`] = {
        ...document,
        uri: document?.fileCopyUri || ("file://" + document?.path),
      }
    }
   
  
  }
  return attachments
}

export const getAttachmentsIdsFromDeleteIndexArrays = (array) => {
  if (!array) return {}
  let attachmentIds = {}
  for (let i = 0; i < array.length; i++) {
    let id = array[i]
    attachmentIds[`deleteAttachmentIds[${i}]`] = array[i]
  }
  return attachmentIds
}
export const formatArrayForPostData = (array, key = 'deleteAttachmentIds') => {
  if (!array) return {}
  let attachmentIds = {}
  for (let i = 0; i < array.length; i++) {
    let id = array[i]
    attachmentIds[`${key}[${i}]`] = array[i]
  }
  return attachmentIds
}

export const getImageFromPickedImage = (image) => {
  if (!image) return null
  let extension = image.uri.match(/\.\w{3,4}($)/)
  if (!extension) return null

  let type = ''
  if (extension.length > 0) {
    switch (extension[0]) {
      case '.jpg':
        type = 'image/jpeg'
        break
      case '.jpeg':
        type = 'image/jpeg'
        break
      case '.png':
        type = 'image/png'
        break
    }

    if (type == '') return null

    return {
      name: `image${extension}`,
      type,
      uri: image.uri,
    }
  }

  return null
}

export const getImageFromPickedImagePath = (image) => {
  if (!image) return null
  let extension = image.match(/\.\w{3,4}($)/)
  if (!extension) return null

  let type = ''
  if (extension.length > 0) {
    switch (extension[0]) {
      case '.jpg':
        type = 'image/jpeg'
        break
      case '.jpeg':
        type = 'image/jpeg'
        break
      case '.png':
        type = 'image/png'
        break
    }

    if (type == '') return null

    return {
      name: `image${extension}`,
      type,
      uri: image.uri,
    }
  }

  return null
}

export const getAttachmentFileNameFromUri = (uri) => {
  //console.log('uri..........', uri)
  if (!uri) return null
  const FILENAME_REGEX = /[^/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/
  const match = uri.match(FILENAME_REGEX)

  
  
  if (match.length > 0) {
    let ext = match[0].substr(match[0].lastIndexOf('.') + 1)
    let fileName = match[0].substr(0, match[0].lastIndexOf('.'))
    if(fileName.length > 20){
      fileName = fileName.slice(0,20)+ "..."
    }
    //console.log('---------',ext,'----------',fileName)
    return fileName
  }

  return null
}

export const getAttachmentNameFromUri= (uri,ext) => {
  //console.log('uri..........', uri)
  if (!uri) return null
  const FILENAME_REGEX = /[^/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/
  const match = uri.match(FILENAME_REGEX)

  
  
  if (match.length > 0) {
    // let ext = match[0].substr(match[0].lastIndexOf('.') + 1)
    let fileName = match[0].substr(0, match[0].lastIndexOf('.'))
    if(fileName.length > 20){
      fileName = fileName.slice(0,20)+ "..."
    }
    console.log('---------',ext,'----------',fileName)
    return fileName + ext
  }

  return null
}

export const getFileExtenstionFromUri = (uri) => {
  if (!uri) return null
  const FILEEXTENSION_REGEX = /\.[0-9a-z]+$/i
  const match = uri.match(FILEEXTENSION_REGEX)
  if (match.length > 0) {
    return match[0]
  }

  return null
}
