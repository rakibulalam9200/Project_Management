import { Camera, CameraType, FlashMode } from 'expo-camera'
import { Audio, ResizeMode, Video } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import React, { useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import LottieView from 'lottie-react-native'
import colors from '../../assets/constants/colors'
import CancelIcon from '../../assets/svg/cameracancel.svg'
import CaptureIcon from '../../assets/svg/capturephoto.svg'
import FlashIcon from '../../assets/svg/flash.svg'
import GalleryIcon from '../../assets/svg/gallery-white.svg'
import SwitchIcon from '../../assets/svg/switchcamera.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CrossIcon from '../../assets/svg/cross.svg'
import PauseIcon from '../../assets/svg/pause-solid.svg'
import PlayIcon from '../../assets/svg/play-solid.svg'
import SaveIcon from '../../assets/svg/save-icon.svg'
import Cross from '../../assets/svg/crossIcon.svg'

const WINDOW_HEIGHT = Dimensions.get('window').height
const WINDOW_WIDTH = Dimensions.get('window').width
const CAPTURE_SIZE = Math.floor(WINDOW_HEIGHT * 0.08)

export default function CameraModal({
  children,
  visibility,
  setVisibility,
  onSave = null,
  onPressGallery,
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  let cameraRef = useRef()
  const backScreen = null
  const [hasCameraPermission, setHasCameraPermission] = useState()
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState()
  const [photo, setPhoto] = useState()
  const [type, setType] = useState(CameraType.back)
  const [flash, setFlash] = useState(FlashMode.off)
  const [isRecording, setIsRecording] = useState(false)
  const [video, setVideo] = useState(null)
  const videoRef = useRef(null)
  const [status, setStatus] = useState({})
  const [audioPermission, setAudioPermission] = useState(null)

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync()
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync()
      await Audio.requestPermissionsAsync()
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })
      setAudioPermission(true)
      setHasCameraPermission(cameraPermission.status === 'granted')
      setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted')
    })()
    return () => {
      setHasCameraPermission(false)
      setHasMediaLibraryPermission(false)
    }
  }, [])

  let renderContent = () => {
    return <Text>C</Text>
  }
  let takePic = async () => {
    //console.log('taking picture')
    let options = {
      quality: 0.6,
      base64: true,
      exif: false,
    }

    let newPhoto = await cameraRef.current.takePictureAsync(options)
    //console.log(newPhoto, 'new photo...')
    setPhoto(newPhoto)
  }

  const toggleCamera = () => {
    setType((value) => (value == CameraType.back ? CameraType.front : CameraType.back))
  }
  const cancelCapture = () => {
    setPhoto(undefined)
    setVideo(undefined)
    cameraRef?.current?.stopRecording()
    closeModal()
  }

  const changeFlashMode = () => {
    setFlash((prev) => (prev == FlashMode.off ? FlashMode.on : FlashMode.off))
  }
  const saveBase64 = async (base64String) => {
    const base64Data = base64String.replace('data:image/jpeg;base64,', '')

    try {
      const uri = FileSystem.cacheDirectory + 'tempimage.jpg'

      //console.log(uri, 'image uri.....')
      try {
        await FileSystem.writeAsStringAsync(uri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        })
        if (onSave) {
          onSave(uri)
          setVisibility(false)
          setPhoto(undefined)
        }
      } catch (err) {
        //console.log(err)
      }

      //console.log(uri)
    } catch (e) {
      //console.log(e)
    }
  }

  const stopRecord = () => {
    //console.log('stopping recording')
    setIsRecording(false)
    if (cameraRef.current) {
      cameraRef.current.stopRecording()
      //console.log('stopped recording')
    }
  }

  const onRecord = async () => {
    // console.log('Camera.isAvailableAsync', await Camera.isAvailableAsync())
    // if (await Camera.isAvailableAsync()) {
      
    if (cameraRef.current) {
      setIsRecording(true)
      const options = { quality: '720p', maxDuration: 58, durationLimit: 58 }
      const data = await cameraRef.current.recordAsync(options)
      const source = data.uri
      //console.log(source, 'source....')
      setVideo(source)
      setIsRecording(false)
    }
    // }
  }
  const handleSave = async () => {
    if (video) {
      const asset = await MediaLibrary.createAssetAsync(video)
      const album = await MediaLibrary.getAlbumAsync('Expo')
      if (album == null) {
        await MediaLibrary.createAlbumAsync('Expo', asset, false)
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false)
      }
    }
  }
  if (hasCameraPermission === undefined) {
    renderContent = () => {
      return <Text>Requesting permissions...</Text>
    }
  } else if (!hasCameraPermission) {
    renderContent = () => {
      return <Text>Permission for camera not granted. Please change this in settings.</Text>
    }
  }

  if (photo) {
    let savePhoto = () => {
      saveBase64(photo.base64)
    }
    renderContent = () => {
      return (
        <View style={styles.container}>
          <Image
            style={styles.preview}
            source={{ uri: 'data:image/jpeg;base64,' + photo.base64 }}
          />
          <View
            style={{
              backgroundColor: colors.NORMAL,
              paddingHorizontal: 16,
              paddingVertical: 16,
              gap: 10,
            }}
          >
            {hasMediaLibraryPermission ? (
              <CButtonInput label="Save" onPress={savePhoto} />
            ) : undefined}
            <CButtonInput label="Discard" onPress={() => setPhoto(undefined)} />
          </View>
        </View>
      )
    }
  } else if (video) {
    renderContent = () => {
      return (
        <View style={styles.videoContainer}>
          <View>
            <Video
              ref={videoRef}
              style={{ height: '80%' }}
              source={{
                uri: video,
              }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              onPlaybackStatusUpdate={(status) => setStatus(() => status)}
            />
            <View style={styles.videoButtons}>
              <TouchableOpacity
                onPress={() => setVideo(null)}
                style={[
                  styles.playPause,
                  { backgroundColor: colors.WHITE, borderWidth: 1, borderColor: colors.ICON_BG },
                ]}
              >
                <Cross />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playPause}
                onPress={() =>
                  status.isPlaying ? videoRef.current.pauseAsync() : videoRef.current.playAsync()
                }
              >
                {status.isPlaying ? <PauseIcon /> : <PlayIcon />}
              </TouchableOpacity>

              {hasMediaLibraryPermission ? (
                <TouchableOpacity
                  onPress={handleSave}
                  style={[
                    styles.playPause,
                    {
                      backgroundColor: colors.WHITE,
                      borderWidth: 1,
                      borderColor: colors.ICON_BG,
                    },
                  ]}
                >
                  <SaveIcon />
                </TouchableOpacity>
              ) : undefined}
            </View>
          </View>
        </View>
      )
    }
  } else {
    renderContent = () => {
      return (
        <Camera style={styles.container} ref={cameraRef} type={type} flashMode={flash}>
          <View style={styles.buttonContainerBottom}>
            <TouchableOpacity
              onPress={() => {
                onPressGallery()
                closeModal()
              }}
            >
              <GalleryIcon />
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={takePic}> */}

            <Pressable
              onPress={takePic}
              onLongPress={onRecord}
              onPressOut={stopRecord}
              delayPressIn={100}
            >
              {isRecording ? (
                <LottieView
                  style={{ width: 91, opacity: 1, aspectRatio: 1 }}
                  source={require('../../assets/lottiefiles/videorecording.json')}
                  autoPlay
                  loop
                />
              ) : (
                <CaptureIcon />
              )}
            </Pressable>

            <TouchableOpacity onPress={toggleCamera}>
              <SwitchIcon />
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainerTop}>
            <TouchableOpacity onPress={cancelCapture}>
              <CancelIcon />
            </TouchableOpacity>
            <TouchableOpacity onPress={changeFlashMode}>
              <FlashIcon />
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <Text style={styles.videoText}>Hold for video, Tap for photo </Text>
          </View>
        </Camera>
      )
    }
  }
  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={styles.safeArea}>{renderContent()}</SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    // backgroundColor: 'white',
  },

  videoContainer: {
    flex: 1,
    // borderWidth: 1,
    paddingVertical: 16,
    backgroundColor: colors.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  videoButtons: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  playPause: {
    alignSelf: 'center',
    backgroundColor: colors.ICON_BG,
    borderRadius: 5,
    height: CAPTURE_SIZE,
    width: CAPTURE_SIZE,
    borderRadius: Math.floor(CAPTURE_SIZE / 2),
    marginBottom: 8,
    marginHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: colors.NORMAL,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margintop: 20,
  },
  buttonContainerTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.NORMAL,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  buttonContainerBottom: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1,
  },
  capture: {
    backgroundColor: colors.WHITE,
    borderRadius: 5,
    height: CAPTURE_SIZE,
    width: CAPTURE_SIZE,
    borderRadius: Math.floor(CAPTURE_SIZE / 2),
    marginBottom: 8,
    marginHorizontal: 30,
  },
  videoText: {
    color: colors.WHITE,
    fontFamily: 'inter-regular',
  },

  safeArea: {
    flex: 1,
    // paddingTop: Platform.OS == 'android' ? 0 : 0,
    // paddingBottom: 500,
    backgroundColor: colors.NORMAL,
  },
})
