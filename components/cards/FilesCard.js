import React from 'react'
import { View, StyleSheet, Text, Image, TouchableOpacity, Alert } from 'react-native'
import { getFileExtenstionFromUri } from '../../utils/Attachmets'
import { downLoadImage, downloadPdf } from '../../utils/DownloadAttachment'

const FilesCard = ({ item }) => {
  const { name, url, created_at } = item
  const extension = getFileExtenstionFromUri(url)
  // //console.log(url)

  // if (extension == 'png' || extension == 'jpg') {
  //   let ShowImage =

  return (
    <TouchableOpacity onPress={async () => {
      if (extension === '.png' || extension === '.jpg') {
        let message = await downLoadImage(url, name)
        if (message) {
          Alert.alert(JSON.stringify(message))
        }
      } else {
        let message = await downloadPdf(url, name)
        if (message) {
          Alert.alert(JSON.stringify(message))
        }
      }
      //console.log(name)
    }}>

      <View style={[styles.listContainer]}>
        <View>
          {extension === '.jpg' || extension === '.png' ? (
            <Image style={styles.image} source={{ uri: url }}></Image>
          ) : (
            <View style={[styles.pdfContainer]}>
              <Text style={{ fontWeight: '500' }}>{extension.slice(1).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={[styles.itemTitle]}>
          <Text style={{ marginBottom: 8, fontSize: 16, fontWeight: '500' }}>{name}</Text>
          <Text style={{ color: '#9CA2AB', fontWeight: '400' }}>{created_at}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  image: {
    height: 64,
    width: 64,
    borderRadius: 10,
  },
  listContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },

  itemTitle: {
    marginLeft: 16,
  },

  pdfContainer: {
    height: 64,
    width: 64,
    borderRadius: 10,
    backgroundColor: '#D6E2FF',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
})

export default FilesCard
