import { useIsFocused } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import ToggleSwitch from 'toggle-switch-react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import DotsIcon from '../../assets/svg/dots.svg'
import EditIcon from '../../assets/svg/edit.svg'
import CameraIcon from '../../assets/svg/member.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CDateTime from '../../components/common/CDateTime'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import IconWrap from '../../components/common/IconWrap'
import RolePickerModal from '../../components/modals/RolePickerModal'
import { setNormal } from '../../store/slices/tab'
import { getImageFromPickedImage } from '../../utils/Attachmets'
import { getErrorMessage, hasEmailErrors, hasRolePickerErrors } from '../../utils/Errors'
import { getDateWithZeros } from '../../utils/Timer'
import { Dimensions } from 'react-native'
// import { KeyboardAvoidingView } from 'react-native'

export default function UserAddScreen({ navigation, route }) {
  const { userSettings } = useSelector((state) => state?.user)
  const fromDirectoryDetails = route?.params?.fromDirectoryDetail ? true : false
  const groupId = route.params ? route?.params?.groupId : null
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [userEmail, setUserEmail] = useState('')
  const [userRate, setUserRate] = useState('')
  const [userName, setUserName] = useState('')
  const [userSurName, setUserSurName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [showRolePickerModal, setShowRolePickerModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState({ id: -1 })
  const [showGroupPickerModal, setShowGroupPickerModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState({ id: -1 })
  const [userActive, setUserActive] = useState(true)
  const iconWrapColors = [colors.PRIM_BG, colors.MID_BG, colors.END_BG]
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [image, setImage] = useState({ uri: null })
  const [errorMessages, setErrorMessages] = useState({
    email: '',
    // rate: '',
    // group: '',
    role: '',
  })
  const [dateOfBirth, setDateOfBirth] = useState()
  const [customTimeLogLimits, setCustomTimeLogLimits] = useState(true)
  const [maxWorkingHoursPerDay, setMaxWorkingHoursPerDay] = useState('8')
  const [maxWorkingHoursPerWeek, setMaxWorkingHoursPerWeek] = useState('40')
  const [keyboardShow, setKeyboardShow] = useState(false)

  const goBack = () => {
    navigation.goBack()
  }

  const openRolePickerModal = () => {
    setShowRolePickerModal(true)
  }

  const openGroupPickerModal = () => {
    setShowGroupPickerModal(true)
  }

  const saveUser = () => {
    if (
      hasEmailErrors(userEmail, setErrorMessages) ||
      hasRolePickerErrors(selectedRole, setErrorMessages)
    )
      return
    const body = {
      email: userEmail,
      rate: userRate,
      user_status: userActive ? 'active' : 'disable',
      ucs_for_timelog_limit: customTimeLogLimits ? 1 : 0,
    }
    if (!customTimeLogLimits) {
      body['max_wh_per_week'] = maxWorkingHoursPerWeek
      body['max_wh_per_day'] = maxWorkingHoursPerDay
    }
    if (dateOfBirth) {
      body['dob'] = getDateWithZeros(dateOfBirth)
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

    if (groupId) {
      body['group_id'] = groupId
    }

    if (selectedRole.id != -1) {
      body['role_id'] = selectedRole.id
    }

    if (image.uri) {
      if (!image.uri.includes('http')) {
        let formattedImage = getImageFromPickedImage(image)
        if (formattedImage) body['image_file'] = formattedImage
      }
    }
    //console.log(body)
    setLoading(true)

    api.user
      .inviteUser(body)
      .then((res) => {
        if (res.status) {
          if (fromDirectoryDetails) {
            navigation.goBack()
          } else {
            navigation.navigate('Users', {
              refetch: Math.random(),
              id: groupId,
            })
          }
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
  }

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

  useEffect(() => {}, [])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  const { height, width } = Dimensions.get('window')

  return (
    <SafeAreaView style={s.outerContainer}>
      <RolePickerModal
        visibility={showRolePickerModal}
        setVisibility={setShowRolePickerModal}
        selected={selectedRole}
        setSelected={setSelectedRole}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={keyboardShow}
        // keyboardVerticalOffset={100}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            console.log('click here.........')
            Keyboard.dismiss()
            setKeyboardShow(false)
          }}
        >
          <View
            style={[
              { flex: 1, paddingHorizontal: 16 },
              keyboardShow
                ? { marginBottom: 16 }
                : { marginBottom: Platform.OS === 'ios' && height > 670 ? 62 : 76 },
            ]}
          >
            <CHeaderWithBack
              title={'Add New Employee'}
              onPress={goBack}
              containerStyle={{ marginTop: 0 }}
            />
            <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>
              <View
                style={[
                  {
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: 16,
                    marginBottom: 0,
                  },
                ]}
              >
                <View style={[s.imageContainer]}>
                  {image.uri ? (
                    <Image source={image} style={{ width: 100, height: 100 }} />
                  ) : (
                    <IconWrap style={{ width: 100, height: 100, marginTop: 8 }}>
                      <CameraIcon />
                    </IconWrap>
                  )}
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
                label="Email"
                placeholder="Email"
                containerStyle={{ marginTop: 0 }}
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

              <CSelectWithLabel
                label="Company Role"
                onPress={openRolePickerModal}
                selectText={selectedRole.id != -1 ? selectedRole.name : 'Select'}
                showErrorMessage={errorMessages.role !== ''}
                errorMessage={errorMessages.role}
                required
              />

              <View style={[{ marginVertical: 16 }]}>
                <Text
                  style={s.textStyle}
                >{`Licenses ( ${userSettings?.organization?.org_subscription?.subscription_plan?.available_user} of ${userSettings?.organization?.org_subscription?.subscription_plan?.max_user} available ) `}</Text>
                <ToggleSwitch
                  isOn={userActive}
                  onColor="green"
                  offColor={colors.SEC_BG}
                  labelStyle={{ color: 'black', fontWeight: '900' }}
                  size="medium"
                  onToggle={(isOn) => setUserActive(isOn)}
                  animationSpeed={150}
                />
              </View>
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
              {showAdvanced && (
                <View onStartShouldSetResponder={() => !keyboardShow}>
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
                    // showErrorMessage
                    // errorMessage={errorMessages.userName}
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
                    // showErrorMessage
                    // errorMessage={errorMessages.surName}
                  />
                  <CInputWithLabel
                    label="Phone"
                    placeholder="Phone"
                    value={userPhone}
                    setValue={setUserPhone}
                    onFocus={() => {
                      setKeyboardShow(true)
                    }}
                    onBlur={() => {
                      setKeyboardShow(false)
                    }}
                    // showErrorMessage
                    // errorMessage={errorMessages.phone}
                  />
                  <CInputWithLabel
                    label="Rate"
                    placeholder="$"
                    value={userRate}
                    setValue={setUserRate}
                    onFocus={() => {
                      setKeyboardShow(true)
                    }}
                    onBlur={() => {
                      setKeyboardShow(false)
                    }}
                    // showErrorMessage
                    // errorMessage={errorMessages.rate}
                    containerStyle={s.textInputContainer}
                  />

                  <View style={[{ marginVertical: 16 }]}>
                    <Text style={s.textStyle}>Time Log Limits:</Text>
                    <View style={g.containerLeft}>
                      <ToggleSwitch
                        isOn={customTimeLogLimits}
                        onColor="green"
                        offColor={colors.SEC_BG}
                        labelStyle={{ color: 'black', fontWeight: '900' }}
                        size="medium"
                        onToggle={(isOn) => setCustomTimeLogLimits(isOn)}
                        animationSpeed={150}
                      />
                      <Text style={s.toggleSwithText}>Use company settings</Text>
                    </View>
                  </View>
                  {!customTimeLogLimits && (
                    <>
                      <CInputWithLabel
                        label="Max Working hours per week:"
                        placeholder="__:__"
                        value={maxWorkingHoursPerWeek}
                        setValue={setMaxWorkingHoursPerWeek}
                        showErrorMessage
                        errorMessage={errorMessages.maxWorkingHoursPerWeek}
                        containerStyle={s.textInputContainer}
                        numeric
                      />
                      <CInputWithLabel
                        label="Max working hours per day:"
                        placeholder="__:__"
                        value={maxWorkingHoursPerDay}
                        setValue={setMaxWorkingHoursPerDay}
                        showErrorMessage
                        errorMessage={errorMessages.maxWorkingHoursPerDay}
                        containerStyle={s.textInputContainer}
                        numeric
                      />
                    </>
                  )}
                  <CDateTime
                    pickedDate={dateOfBirth}
                    setPickedDate={setDateOfBirth}
                    type="date"
                    showLabel={true}
                    label={'Date of Birth'}
                    containerStyle={{ width: '100%', marginVertical: 8 }}
                  />
                </View>
              )}
            </ScrollView>
            <CButtonInput label={'Save'} onPress={saveUser} loading={loading} />
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
    // paddingHorizontal: 20,
    // marginBottom: 64,
  },
  textInputContainer: {
    marginVertical: 8,
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
    backgroundColor: 'green',
    // borderColor: colors.LIGHT_NORMAL,
    // borderWidth: 1,
  },
  editButtonContainer: {
    position: 'relative',
    top: -34,
    left: 32,
    width: 32,
    height: 32,
    // backgroundColor:"green"
  },
})
