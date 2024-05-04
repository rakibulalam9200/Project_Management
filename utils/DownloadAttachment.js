import * as FileSystem from 'expo-file-system'
import { StorageAccessFramework } from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'

export const downLoadImage = async (uri, filename, fileExt = '') => {
  const getTime = new Date().toLocaleTimeString().replace(/:/g, '-').replace(/\s/g, '')
  const newFileName = filename + '-' + getTime  
  const fileUri = `${FileSystem.documentDirectory}${newFileName}.${fileExt}`
  const downloadedFile = await FileSystem.downloadAsync(uri, fileUri)
  if (downloadedFile.status !== 200) {
    return 'Error happend while downloading the image'
  }
  try {
    const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri)
    const album = await MediaLibrary.getAlbumAsync('Download')
    if (album == null) {
      await MediaLibrary.createAlbumAsync('Download', asset, false)
      return 'Successfully Saved to Download'
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false)
      return 'Successfully Saved to Download'
    }
  } catch (e) {
    return'Error'
  }
}

export const downloadPdf = async (uri, filename, fileExt = '') => {
  const getTime = new Date().toLocaleTimeString().replace(/:/g, '-').replace(/\s/g, '')
  const newFileName = filename + '-' + getTime
  const fileUri = `${FileSystem.documentDirectory}${newFileName}.${fileExt}`
  const downloadedFile = await FileSystem.downloadAsync(uri, fileUri)
  if (downloadedFile.status !== 200) {
    return 'Error'
  }
  const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync()
  if (!permissions.granted) {
    return 'Permission Denied'
  }
  const file = await FileSystem.readAsStringAsync(downloadedFile.uri, {
    encoding: FileSystem.EncodingType.Base64,
  })

  try {
    const uri = await StorageAccessFramework.createFileAsync(
      permissions.directoryUri,
      filename,
      'application/pdf'
    )
    await FileSystem.writeAsStringAsync(uri, file, {
      encoding: FileSystem.EncodingType.Base64,
    })
    return 'Successfully Saved to Download'
  } catch (e) {
    // console.log('PDF download err Here -> ', e)
    return 'Error while saving PDF'
  }
}
