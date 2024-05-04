import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native'
import React, { useState, useEffect } from 'react'
import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'
import EditIcon from '../../assets/svg/edit.svg'
import IconWrap from '../../components/common/IconWrap'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import CButtonInput from '../../components/common/CButtonInput'
import * as ImagePicker from 'expo-image-picker'
import TimeZoneModal from '../../components/modals/TimeZoneModal'
import { useDispatch } from 'react-redux'
import { useIsFocused } from '@react-navigation/native'
import { setNormal } from '../../store/slices/tab'
import MoreIcon from '../../assets/svg/more.svg'
import CMidHeaderWithIcons from '../../components/common/CMidHeaderWithIcons'
import api from '../../api/api'
import {
  getErrorMessage,
  hasUserAddressErrors,
  hasUserDomainErrors,
  hasEmailErrors,
  hasTimeZoneErrors,
  hasUserNameErrors,
} from '../../utils/Errors'
import { getImageFromPickedImage } from '../../utils/Attachmets'
import { useRef } from 'react'
import CDateTime from '../../components/common/CDateTime'
import { loadUser } from '../../store/slices/auth'
import { extractDateFormatDots, getDate, getYearMonthDayDateFromDateObj } from '../../utils/Timer'
import { set } from 'lodash'
import PasswordPrompt from '../../components/modals/PasswordPromptModal'
import PhoneUpdatePrompt from '../../components/modals/PhoneUpdatePrompt'
import CodeInputPrompt from '../../components/modals/CodeInputPrompt'
import { StatusBar } from 'react-native'

export default function MyProfile({ navigation, route }) {
  const scrollViewRef = useRef(null)
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [showTimeZoneModal, setShowTimeZoneModal] = useState(false)
  const [image, setImage] = useState({ uri: null })
  const [userFirstName, setUserFirstName] = useState('')
  const [userLastName, setUserLastName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [phone, setPhone] = useState('')
  const previousPhone = useRef('')
  const [timeZoneIndex, setTimeZoneIndex] = useState({ index: -1 })
  const [timeZone, setTimeZone] = useState('')
  const [dob, setDob] = useState('')
  // const [openPasswordPrompt, setOpenPasswordPrompt] = useState(false)
  const [openPhoneInputPrompt, setOpenPhoneInputPrompt] = useState(false)
  const [openCodeInputPrompt, setOpenCodeInputPrompt] = useState(false)
  const [refresh, setRefresh] = useState(false)

  const [errorMessages, setErrorMessages] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    dob: '',
    email: '',
    timezone: '',
  })

  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  useEffect(() => {
    if (isFocused) dispatch(setNormal())
  }, [isFocused])

  const goBack = () => {
    navigation.goBack()
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })
    // //console.log(result)
    if (!result.canceled) {
      //console.log(result.assets[0].uri)
      setImage({ uri: result.assets[0].uri })
    }
  }

  // Check phone number changed or not

  // const checkPhoneChanged = () => {
  //   if (previousPhone.current != userPhone) {
  //     // Alert.alert('Phone Number can not be changed')
  //     //console.log({ userPhone })
  //     setOpenPasswordPrompt(true)
  //   } else {
  //     updateProfile()
  //   }
  // }

  // Update the user profile
  const updateProfile = () => {
    let body = {
      first_name: userFirstName,
      last_name: userLastName,
      time_zone: timeZoneIndex.index != -1 ? timeZoneIndex.item.value : timeZone,
      dob: getDate(dob),
    }
    if (image.uri) {
      // if the uri is a local uri , add it to the body

      if (!image.uri.includes('http')) {
        let formattedImage = getImageFromPickedImage(image)
        if (formattedImage) body['image_file'] = formattedImage
      }
    }

    //console.log({ body })
    api.user
      .updateUser(body)
      .then((res) => {
        if (res.success) {
          navigation.goBack()
        }
        dispatch(loadUser())
      })
      .catch((err) => {
        //console.log(err)
        //console.log(err.response)
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })

    // //console.log(body)
  }

  const handleSendVerificationCode = (phone) => {
    api.user
      .sendSMSVerificationCode({ phone })
      .then((res) => {
        if (res.success) {
          //console.log('SMS sent')
          // setOpenPhoneInputPrompt(false)
          setPhone(phone)
          setOpenCodeInputPrompt(true)
        }
      })
      .catch((err) => {
        //console.log(err)
        Alert.alert('An error occurred. Please try again later')
        // setOpenPhoneInputPrompt(false)
      })
  }

  const handleVerifyCode = (code) => {
    api.user
      .verifySMSVerificationCode({ phone: phone, code })
      .then((res) => {
        if (res.success) {
          //console.log('Code verified', res)
          setOpenCodeInputPrompt(false)
          updatePhone(res.token)
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })
  }

  const updatePhone = (token) => {
    const body = {
      phone: phone,
      token,
    }
    api.user
      .updatePhoneNumber(body)
      .then((res) => {
        //console.log(res)
        if (res.success) {
          //console.log('Success')
          Alert.alert('Phone number updated successfully')
          dispatch(loadUser())
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })
      .finally(() => {
        setRefresh(!refresh)
      })
  }

  useEffect(() => {
    const getUserDetails = async () => {
      api.user
        .getUser()
        .then((res) => {
          if (res.success) {
            const { first_name, last_name, email, image, phone, time_zone, dob } = res.user
            //console.log({ phone })
            if (first_name != null) setUserFirstName(first_name)
            if (last_name != null) setUserLastName(last_name)
            if (email != 'null') setUserEmail(email)
            if (phone == 'null' || phone == null) {
              setUserPhone('')
              previousPhone.current = ''
            } else {
              setUserPhone(phone)
              previousPhone.current = phone
            }
            if (time_zone != 'null' && time_zone != '') setTimeZone(time_zone)
            if (dob != 'null') {
              setDob(new Date(dob))
            }
            if (image) setImage({ uri: image })
          }
        })
        .catch((err) => {
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
    }
    getUserDetails()
  }, [refresh])

  return (
    <SafeAreaView
      style={[
        { flex: 1, backgroundColor: colors.CONTAINER_BG },
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <ScrollView
        style={[g.outerContainer, s.containerBG, { paddingHorizontal: 16 }]}
        ref={scrollViewRef}
      >
        <View style={s.innerContainer}>
          <CMidHeaderWithIcons onPress={goBack} title="Profile" iconWrapColors={iconWrapColors}>
            <IconWrap onPress={() => navigation.navigate('UserProfileUpdateScreen')}>
              <MoreIcon fill={colors.ICON_BG} />
            </IconWrap>
          </CMidHeaderWithIcons>

          <TouchableOpacity style={s.container} onPress={pickImage}>
            <View style={s.imageContainer}>
              {image && <Image source={image} style={{ width: 100, height: 100 }} />}
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
          </TouchableOpacity>
          <Text style={s.header}>{userFirstName + ' ' + userLastName}</Text>
          <View style={{ marginTop: 10 }}>
            <View>
              <Text style={s.inputHeader}>Email:</Text>
              <Text style={s.texts}>{userEmail}</Text>
            </View>
            <View style={{ marginTop: 16 }}>
              <Text style={s.inputHeader}>Phone Number:</Text>
              <Text style={s.texts}>{userPhone}</Text>
            </View>
            <View style={{ marginTop: 16 }}>
              <Text style={s.inputHeader}>Birth Date:</Text>
              <Text style={s.texts}>{getYearMonthDayDateFromDateObj(dob)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  containerBG: {
    backgroundColor: colors.CONTAINER_BG,
  },
  innerContainer: {
    marginBottom: 120,
  },

  texts: {
    fontSize: 18,
    color: colors.NORMAL,
    fontWeight: '500',
    marginBottom: 16,
  },

  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.NORMAL,
    textAlign: 'center',
    marginVertical: 16,
  },
  phoneContainer: {
    backgroundColor: colors.START_BG,
    color: colors.HOME_TEXT,
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  inputHeader: {
    fontSize: 14,
    color: colors.HEADER_TEXT,
    marginRight: 12,
    marginBottom: 4,
  },
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
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
    top: -30,
    left: 24,
    width: 32,
    height: 32,
  },
  userName: {
    textAlign: 'center',
    color: colors.NORMAL,
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 20,
  },
  userEmail: {
    textAlign: 'center',
    color: colors.NORMAL,
    fontSize: 16,
  },
  divider: {
    borderBottomColor: colors.SEC_BG,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  detailsText: {
    color: colors.NORMAL,
    fontSize: 16,
    marginLeft: 34,
  },
  detailsContainer: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  timeZoneText: {
    color: colors.NORMAL,
    marginBottom: 16,
    fontWeight: 'bold',
    fontFamily: 'inter-regular',
    fontSize: 16,
  },
})
