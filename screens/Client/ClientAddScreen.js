import { useIsFocused } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import React, { useEffect, useRef, useState } from 'react'
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
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import DotsIcon from '../../assets/svg/dots.svg'
import EditIcon from '../../assets/svg/edit.svg'
import CameraIcon from '../../assets/svg/member.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CMidHeaderWithIcons from '../../components/common/CMidHeaderWithIcons'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import IconWrap from '../../components/common/IconWrap'
import CompanyPickerModal from '../../components/modals/CompanyPickerModal'
import { setNormal } from '../../store/slices/tab'
import { getImageFromPickedImage } from '../../utils/Attachmets'
import { getErrorMessage, hasCompanyPickerErrors, hasEmailErrors } from '../../utils/Errors'

export default function ClientAddScreen({ navigation, route }) {
  const fromDirectoryDetails = route?.params?.fromDirectoryDetail ? true : false
  const groupId = route.params ? route?.params?.groupId : null
  const company = route.params ? route?.params?.company : null

  const { currentClientGroupId } = useSelector((state) => state.navigation)
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [userEmail, setUserEmail] = useState('')
  const [userRate, setUserRate] = useState('')
  const [userName, setUserName] = useState('')
  const [userSurName, setUserSurName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [userAddress, setUserAddress] = useState('')
  const [userWebsite, setUserWebsite] = useState('')
  const [showCompanyPickerModal, setShowCompanyPickerModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(() => {
    if (company?.id) {
      return company
    } else
      return {
        id: -1,
        name: '',
      }
  })

  const [userActive, setUserActive] = useState(true)
  const iconWrapColors = [colors.PRIM_BG, colors.MID_BG, colors.END_BG]
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [errorMessages, setErrorMessages] = useState({
    email: '',
    company: '',
  })
  const [dateOfBirth, setDateOfBirth] = useState()
  const [customTimeLogLimits, setCustomTimeLogLimits] = useState(true)
  const [maxWorkingHoursPerDay, setMaxWorkingHoursPerDay] = useState('8')
  const [maxWorkingHoursPerWeek, setMaxWorkingHoursPerWeek] = useState('40')

  const [showTimeZoneModal, setShowTimeZoneModal] = useState(false)
  const [selectedTimeZone, setSelectedTimeZone] = useState({ index: -1, value: 'UTC' })
  const scrollViewRef = useRef(null)
  const multipleSelect = useRef({})
  const [keyboardShow, setKeyboardShow] = useState(false)
  const [image, setImage] = useState({ uri: null })
  const [roleId, setRoleId] = useState(null)

  const resetData = () => {
    setUserName('')
    setUserEmail('')
    setUserSurName('')
    setUserPhone('')
    setSelectedCompany({ id: -1, name: '' })
  }

  const goBack = () => {
    navigation.goBack()
  }

  const openCompanyPicker = () => {
    setShowCompanyPickerModal(true)
  }

  const saveUser = () => {
    if (hasEmailErrors(userEmail, setErrorMessages)) {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
      return
    }

    if (hasCompanyPickerErrors(selectedCompany.name, setErrorMessages)) {
      setShowAdvanced(true)
      return
    }
    const body = {
      email: userEmail,
      user_status: 'active',
      ucs_for_timelog_limit: 1,
    }

    if (userName) {
      body['first_name'] = userName
    }
    if (userSurName) {
      body['last_name'] = userSurName
    }

    if (userPhone) {
      body['phone'] = userPhone
    }

    if (currentClientGroupId) {
      body['group_id'] = currentClientGroupId
    }
    if (roleId) {
      body['role_id'] = roleId
    }

    if (selectedCompany?.id > -1) {
      body['client_company_id'] = selectedCompany?.id
    }

    if (image.uri) {
      if (!image.uri.includes('http')) {
        let formattedImage = getImageFromPickedImage(image)
        if (formattedImage) body['image_file'] = formattedImage
      }
    }
    setLoading(true)
    api.user
      .inviteUser(body)
      .then((res) => {
        // console.log(res, 'res..................')
        if (res.status) {
          if (fromDirectoryDetails) {
            navigation.goBack()
          } else {
            navigation.navigate('ClientListScreen', {
              refetch: Math.random(),
              id: groupId,
            })
          }
          resetData()
        }
      })
      .catch((err) => {
        // console.log(err, 'error...............')
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

  useEffect(() => {
    const body = {
      allData: true,
    }
    body[`only[0]`] = 'Client'
    api.role
      .getRoles(body)
      .then((res) => {
        // console.log(res && res[0]?.id, '-----something response -----------')
        if (res) {
          setRoleId(res[0]?.id)
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
  }, [])

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.START_BG }}>
      <CompanyPickerModal
        visibility={showCompanyPickerModal}
        setVisibility={setShowCompanyPickerModal}
        selected={selectedCompany}
        setSelected={setSelectedCompany}
      />
      {/* <TimeZoneModal
        visibility={showTimeZoneModal}
        setVisibility={setShowTimeZoneModal}
        selectedIndex={selectedTimeZone}
        setSelectedIndex={setSelectedTimeZone}
      /> */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: colors.WHITE }}
        enabled={keyboardShow}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            // console.log('click here.........')
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
            <CMidHeaderWithIcons
              title={'Add new client'}
              onPress={goBack}
              containerStyle={{ paddingHorizontal: 16 }}
            />

            <ScrollView
              style={s.container}
              ref={scrollViewRef}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="on-drag"
              nestedScrollEnabled={true}
            >
              <View onStartShouldSetResponder={() => !keyboardShow}>
                <CInputWithLabel
                  label="Email"
                  placeholder="Email"
                  value={userEmail}
                  setValue={setUserEmail}
                  showErrorMessage={errorMessages.email !== ''}
                  errorMessage={errorMessages.email}
                  required
                  onFocus={() => {
                    setKeyboardShow(true)
                  }}
                  onBlur={() => {
                    setKeyboardShow(false)
                  }}
                />

                <View style={g.moreContainerRight}>
                  <Text style={s.inputHeader}>{showAdvanced ? 'Less ' : 'More '} Options</Text>
                  <IconWrap
                    onPress={() => {
                      setShowAdvanced((prev) => !prev)
                    }}
                    outputRange={iconWrapColors}
                  >
                    <DotsIcon fill={'dodgerblue'} />
                  </IconWrap>
                </View>
              </View>

              <View style={s.divider}></View>
              {showAdvanced && (
                <View onStartShouldSetResponder={() => !keyboardShow}>
                  <View style={[{ flex: 1, alignItems: 'center' }]}>
                    <View style={s.imageContainer}>
                      <View style={s.imageContainer}>
                        {image.uri ? (
                          <Image source={image} style={{ width: 100, height: 100 }} />
                        ) : (
                          <IconWrap style={{ width: 100, height: 100, marginTop: 8 }}>
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
                    label="Name"
                    placeholder="Name"
                    value={userName}
                    setValue={setUserName}
                    onFocus={() => {
                      setKeyboardShow(true)
                    }}
                    onBlur={() => {
                      setKeyboardShow(false)
                    }}
                  />
                  <CInputWithLabel
                    label="Surname"
                    placeholder="Surname"
                    value={userSurName}
                    setValue={setUserSurName}
                    onFocus={() => {
                      setKeyboardShow(true)
                    }}
                    onBlur={() => {
                      setKeyboardShow(false)
                    }}
                  />
                  <CSelectWithLabel
                    label="Company"
                    onPress={openCompanyPicker}
                    selectText={selectedCompany.id != -1 ? selectedCompany.name : 'Select'}
                    showErrorMessage={errorMessages.company !== ''}
                    errorMessage={errorMessages.company}
                  />
                  <CInputWithLabel
                    label="Phone"
                    placeholder="Phone"
                    value={userPhone}
                    setValue={setUserPhone}
                    showErrorMessage
                    errorMessage={errorMessages.phone}
                    onFocus={() => {
                      setKeyboardShow(true)
                    }}
                    onBlur={() => {
                      setKeyboardShow(false)
                    }}
                  />

                  {/* <CSelectWithLabel
                    label="Time Zone"
                    onPress={() => setShowTimeZoneModal(true)}
                    selectText={selectedTimeZone.index != -1 ? selectedTimeZone.item.value : 'UTC'}
                    showErrorMessage
                    errorMessage={errorMessages.timezone}
                    required
                  /> */}
                </View>
              )}
            </ScrollView>
            <View style={{ paddingHorizontal: 16 }}>
              <CButtonInput label={'Send invite'} onPress={saveUser} loading={loading} />
            </View>
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
    paddingHorizontal: 16,
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
    top: -34,
    left: 32,
    width: 32,
    height: 32,
  },
  divider: {
    borderBottomColor: colors.SEC_BG,
    borderBottomWidth: 1,
    marginTop: 0,
    marginBottom: 16,
  },
})
