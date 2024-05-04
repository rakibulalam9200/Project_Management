import React, { useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '../../assets/constants/colors'

import { useIsFocused } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import EditIcon from '../../assets/svg/edit.svg'
import CameraIcon from '../../assets/svg/member.svg'
import { getImageFromPickedImage } from '../../utils/Attachmets'

import AutoCompletePLace from '../../components/common/AutoCompletePLace'
import CButtonInput from '../../components/common/CButtonInput'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import IconWrap from '../../components/common/IconWrap'
import { setNormal } from '../../store/slices/tab'
import { getErrorMessage, hasCompanyNameErrors, hasEmailErrors } from '../../utils/Errors'

export default function ClientCompanyAddScreen({ navigation, route }) {
  const id = route.params ? route.params?.id : null
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const iconWrapColors = [colors.PRIM_BG, colors.MID_BG, colors.END_BG]
  const [loading, setLoading] = useState(false)
  const [errorMessages, setErrorMessages] = useState({
    email: '',
    name: '',
  })
  const [image, setImage] = useState({ uri: null })
  const [keyboardShow, setKeyboardShow] = useState(false)
  const goBack = () => {
    navigation.goBack()
  }

  // console.log("-----------------",id)

  useEffect(() => {
    const getClientCompanyDetails = async () => {
      api.clientCompany
        .getSingleClientCompany(id)
        .then((res) => {
          if (res.success) {
            // console.log(res.data,'--------------')
            const { name, email, logo, phone, address, website } = res.data
            setName(name)
            if (address !== null) {
              setAddress(address)
            }
            setEmail(email)
            if (phone !== null) {
              setPhone(phone)
            }
            setWebsite(website)
            if (image) setImage({ uri: logo })
          }
        })
        .catch((err) => {})
    }
    getClientCompanyDetails()
  }, [])

  const saveCompany = () => {
    if (hasCompanyNameErrors(name, setErrorMessages) || hasEmailErrors(email, setErrorMessages)) {
      return
    }
    const body = {
      name,
      email,
    }
    if (phone) {
      body['phone'] = phone
    }

    if (address) {
      body['address'] = address
    }

    if (website) {
      body['website'] = website
    }
    if (image.uri) {
      // console.log("hit here.....",image)
      if (!image.uri.includes('http')) {
        // console.log('hit here ...also........')
        let formattedImage = getImageFromPickedImage(image)
        if (formattedImage) body['logo_file'] = formattedImage
      }
    }
    setLoading(true)
    console.log(body, '......body.........')
    if (id) {
      // console.log("hit here......")
      body['_method'] = 'PUT'
      api.clientCompany
        .updateClientCompany(body, id)
        .then((res) => {
          if (res.success) {
            navigation.navigate('ClientCompanyDetailsScreen', {
              id: id,
              refetch: Math.random(),
            })
            Alert.alert(res.message)
          }
        })
        .catch((err) => {
          let errorMsg = ''
          try {
            errorMsg = getErrorMessage(err)
          } catch (err) {
            errorMsg = 'An error occured. Please try again later.'
          }
          Alert.alert(errorMsg)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      api.clientCompany
        .createClientCompany(body)
        .then((res) => {
          if (res.success) {
            navigation.navigate('ClientCompanyScreen')
            Alert.alert(res.message)
          }
        })
        .catch((err) => {
          // console.log(err,'.........erro...................')
          let errorMsg = ''
          try {
            errorMsg = getErrorMessage(err)
          } catch (err) {
            errorMsg = 'An error occured. Please try again later.'
          }
          Alert.alert(errorMsg)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })
    setImage({ uri: null })
    if (!result.canceled) {
      setImage({ uri: result.assets[0].uri })
    }
  }

  const { height, width } = Dimensions.get('window')

  return (
    <SafeAreaView style={[s.outerContainer, { paddingHorizontal: 16 }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: colors.WHITE }}
        enabled={keyboardShow}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss()
            setKeyboardShow(false)
          }}
        >
          <View
            style={[
              { flex: 1, justifyContent: 'space-between' },
              keyboardShow
                ? { marginBottom: 16 }
                : { marginBottom: Platform.OS === 'ios' && height > 670 ? 62 : 76 },
            ]}
          >
            <CHeaderWithBack
              title={`${id ? 'Update' : 'Add New'} client company`}
              onPress={goBack}
            />
            <ScrollView
              style={s.container}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="always"
            >
              <View style={s.innerContainer} onStartShouldSetResponder={() => !keyboardShow}>
                <View style={[s.container, { alignItems: 'center', marginTop: 16 }]}>
                  <View style={s.imageContainer}>
                    <View style={s.imageContainer}>
                      {image.uri ? (
                        <Image source={image} style={{ width: 100, height: 100 }} />
                      ) : (
                        <IconWrap style={{ width: 100, height: 100, marginTop: 10 }}>
                          <CameraIcon />
                        </IconWrap>
                      )}
                    </View>
                  </View>
                  <View style={s.editButtonContainer}>
                    <IconWrap
                      onPress={pickImage}
                      outputRange={iconWrapColors}
                      style={{
                        width: 32,
                        height: 32,
                      }}
                    >
                      <EditIcon fill={colors.ICON_BG} width={14} height={14} />
                    </IconWrap>
                  </View>
                </View>
                <CInputWithLabel
                  label="Company Name"
                  placeholder="Name"
                  value={name}
                  setValue={setName}
                  showErrorMessage={errorMessages.name !== ''}
                  errorMessage={errorMessages.name}
                  onFocus={() => {
                    setKeyboardShow(true)
                  }}
                  keyboardShow={keyboardShow}
                />
                <CInputWithLabel
                  label="Email"
                  placeholder="Email"
                  value={email}
                  setValue={setEmail}
                  showErrorMessage={errorMessages.email !== ''}
                  errorMessage={errorMessages.email}
                  required
                  onFocus={() => {
                    setKeyboardShow(true)
                  }}
                />
                <CInputWithLabel
                  label="Phone"
                  placeholder="Phone"
                  value={phone}
                  setValue={setPhone}
                  onFocus={() => {
                    setKeyboardShow(true)
                  }}
                />
                <ScrollView
                  horizontal={true}
                  style={{ width: '100%', flex: 1, flexDirection: 'column', marginVertical: 8 }}
                  keyboardShouldPersistTaps="always"
                >
                  <View style={{ flex: 1, width: '100%', marginBottom: 8 }}>
                    <Text style={s.labelStyle}>Address</Text>
                    <AutoCompletePLace
                      setValue={setAddress}
                      value={address}
                      placeholder={'Address'}
                      type=""
                    />
                  </View>
                </ScrollView>

                <CInputWithLabel
                  label="Website"
                  placeholder="www."
                  value={website}
                  setValue={setWebsite}
                  onFocus={() => {
                    setKeyboardShow(true)
                  }}
                />
              </View>
            </ScrollView>
            <CButtonInput label={id ? 'Update' : 'Save'} onPress={saveCompany} loading={loading} />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  container: {
    flex: 1,
    // paddingHorizontal: 16,
  },
  textInputContainer: {
    marginVertical: 4,
  },
  textStyle: {
    fontFamily: 'inter-regular',
    fontSize: 12,
    color: colors.LIGHT_GRAY,
    marginBottom: 4,
  },
  inputHeader: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
  },
  toggleSwithText: {
    fontFamily: 'inter-regular',
    color: colors.NORMAL,
    marginLeft: 8,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.LIGHT_NORMAL,
    borderWidth: 1,
  },
  editButtonContainer: {
    position: 'relative',
    top: -32,
    left: 30,
    width: 32,
    height: 32,
  },
  innerContainer: {
    marginBottom: 64,
    flex: 1,
  },
  labelStyle: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
    marginBottom: 4,
  },
})
