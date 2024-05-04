import React, { useEffect, useState } from 'react'
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import { useIsFocused } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { useDispatch, useSelector } from 'react-redux'
import ToggleSwitch from 'toggle-switch-react-native'
import api from '../../api/api'
import DotsIcon from '../../assets/svg/dots.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import RolePickerModal from '../../components/modals/RolePickerModal'
import { setNormal } from '../../store/slices/tab'
import { getErrorMessage, hasEmailErrors, hasRolePickerErrors } from '../../utils/Errors'

import MemberIcon from '../../assets/img/member.png'
import CDateTime from '../../components/common/CDateTime'
import IconWrap from '../../components/common/IconWrap'
import TimeZoneModal from '../../components/modals/TimeZoneModal'
import { getImageFromPickedImage } from '../../utils/Attachmets'
import { getDateWithZeros } from '../../utils/Timer'

export default function UserEditScreen({ navigation, route }) {
  const { userSettings } = useSelector((state) => state?.user)
  const fromDirectoryDetails = route?.params?.fromDirectoryDetail ? true : false
  const userId = route.params ? route.params?.userId : null
  const groupId = route.params ? route.params?.groupId : null
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [userEmail, setUserEmail] = useState('')
  const [userRate, setUserRate] = useState('')
  const [userName, setUserName] = useState('')
  const [userSurName, setUserSurName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [showRolePickerModal, setShowRolePickerModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState({ id: -1 })
  const [image, setImage] = useState({ uri: null })
  const [userActive, setUserActive] = useState(true)
  const iconWrapColors = [colors.PRIM_BG, colors.MID_BG, colors.END_BG]
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [errorMessages, setErrorMessages] = useState({
    email: '',
    rate: '',
    group: '',
    role: '',
  })
  const [dateOfBirth, setDateOfBirth] = useState(null)
  const [customTimeLogLimits, setCustomTimeLogLimits] = useState(true)
  const [maxWorkingHoursPerDay, setMaxWorkingHoursPerDay] = useState('')
  const [maxWorkingHoursPerWeek, setMaxWorkingHoursPerWeek] = useState('')
  const [showTimeZoneModal, setShowTimeZoneModal] = useState(false)
  const [selectedTimeZone, setSelectedTimeZone] = useState({ index: -1, value: 'UTC' })

  const goBack = () => {
    navigation.goBack()
  }

  const openRolePickerModal = () => {
    setShowRolePickerModal(true)
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setImage({ uri: result.assets[0].uri })
    }
  }
  const updateUser = () => {
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

    body['time_zone'] = selectedTimeZone.value

    if (image.uri) {
      // if the uri is a local uri , add it to the body
      if (!image.uri.includes('http')) {
        let formattedImage = getImageFromPickedImage(image)
        if (formattedImage) body['image_file'] = formattedImage
      }
    }

    setLoading(true)

    api.group
      .updateUser(userId, body)
      .then((res) => {
        //console.log(res)
        if (res.success) {
          if (fromDirectoryDetails) {
            navigation.goBack()
          } else {
            navigation.navigate('UserDetailsScreen', {
              refetch: Math.random(),
              groupId: groupId,
              userId: userId,
            })
          }
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
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
    api.group
      .getUser(userId)
      .then((res) => {
        if (res.success) {
          let user = res?.user
          console.log(user)
          setUserEmail(user?.email)
          setUserName(user?.first_name)
          setUserSurName(user?.last_name)
          setUserPhone(user?.phone)
          setImage({ uri: user?.image })
          setSelectedRole(user?.organization_user_role_setting?.role)
          setCustomTimeLogLimits(
            user?.organization_user_role_setting?.user_setting?.ucs_for_timelog_limit
          )
          setMaxWorkingHoursPerDay(
            String(user?.organization_user_role_setting?.user_setting?.max_wh_per_day)
          )
          setMaxWorkingHoursPerWeek(
            String(user?.organization_user_role_setting?.user_setting?.max_wh_per_week)
          )
          setDateOfBirth(user?.dob ? new Date(user?.dob) : null)
          setSelectedTimeZone({
            index: -1,
            value: user?.organization_user_role_setting?.user_setting?.time_zone,
            item: { value: user?.time_zone },
          })
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
      .finally(() => {})
  }, [])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  return (
    <SafeAreaView style={s.outerContainer}>
      <RolePickerModal
        visibility={showRolePickerModal}
        setVisibility={setShowRolePickerModal}
        selected={selectedRole}
        setSelected={setSelectedRole}
      />
      <TimeZoneModal
        visibility={showTimeZoneModal}
        setVisibility={setShowTimeZoneModal}
        selectedIndex={selectedTimeZone}
        setSelectedIndex={setSelectedTimeZone}
      />

      <View style={{ flex: 1, paddingHorizontal: 16, marginBottom: 64 }}>
        <CHeaderWithBack title={'Edit profile'} onPress={goBack} />
        <ScrollView style={s.container}>
          <View style={[s.imageContainer]}>
            <TouchableWithoutFeedback>
              <Image source={image.uri ? image : MemberIcon} style={s.image} />
            </TouchableWithoutFeedback>
          </View>
          <CInputWithLabel
            label="Email"
            placeholder="Email"
            value={userEmail}
            setValue={setUserEmail}
            editable={false}
            showErrorMessage={errorMessages.email !== ''}
            errorMessage={errorMessages.email}
            required
          />

          <CSelectWithLabel
            label="Company Role"
            onPress={openRolePickerModal}
            selectText={selectedRole.id != -1 ? selectedRole.name : 'Select'}
            showErrorMessage={errorMessages.role !== ''}
            errorMessage={errorMessages.role}
          />

          <View style={[]}>
            <Text style={s.textStyle}>{`Licenses ( ${userSettings?.organization?.org_subscription?.subscription_plan?.available_user} of ${userSettings?.organization?.org_subscription?.subscription_plan?.max_user} available ) `}</Text>
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
            <Text style={s.inputHeader}>{showAdvanced ? 'Hide ' : 'More '} Options</Text>
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
            <>
              <CInputWithLabel
                label="Name"
                placeholder="Name"
                value={userName}
                setValue={setUserName}
                editable={false}
              />
              <CInputWithLabel
                label="Surname"
                placeholder="Surname"
                value={userSurName}
                setValue={setUserSurName}
                editable={false}
              />
              <CInputWithLabel
                label="Phone"
                placeholder="Phone"
                value={userPhone}
                setValue={setUserPhone}
                editable={false}
              />
              <CInputWithLabel
                label="Rate"
                placeholder="$"
                value={userRate}
                setValue={setUserRate}
                containerStyle={s.textInputContainer}
                editable={false}
              />
              <View style={[]}>
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
                disabled={true}
              />
              <CSelectWithLabel
                label="Time Zone"
                onPress={() => setShowTimeZoneModal(true)}
                selectText={selectedTimeZone.index != -1 ? selectedTimeZone.item.value : 'UTC'}
                showErrorMessage
                errorMessage={errorMessages.timezone}
                required
                disabled={true}
              />
            </>
          )}
        </ScrollView>
        <CButtonInput label={'Save'} onPress={updateUser} loading={loading}/>
      </View>
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
  imageContainer: { justifyContent: 'center', flexDirection: 'row', paddingRight: 24 },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 8,
  },
})
