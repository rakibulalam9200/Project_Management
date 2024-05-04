import { useIsFocused } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import EditIcon from '../../assets/svg/edit.svg'
import CameraIcon from '../../assets/svg/member.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CDateTime from '../../components/common/CDateTime'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CMidHeaderWithIcons from '../../components/common/CMidHeaderWithIcons'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import IconWrap from '../../components/common/IconWrap'
import CompanyPickerModal from '../../components/modals/CompanyPickerModal'
import RolePickerModal from '../../components/modals/RolePickerModal'
import TimeZoneModal from '../../components/modals/TimeZoneModal'
import { hasCompanyPickerErrors } from '../../utils/Errors'

export default function ClientEditScreen({ navigation, route }) {
  const fromDirectoryDetails = route?.params?.fromDirectoryDetail ? true : false
  const groupId = route.params ? route?.params?.groupId : null
  const userId = route.params ? route?.params?.userId : null
  const id = route.params ? route?.params?.id : null
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
  const [showRolePickerModal, setShowRolePickerModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState({ id: -1 })
  const [showCompanyPickerModal, setShowCompanyPickerModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState({ id: -1, name: '' })
  const [selectedGroup, setSelectedGroup] = useState({ id: -1 })
  const [userActive, setUserActive] = useState(true)
  const [image, setImage] = useState({ uri: null })
  const iconWrapColors = [colors.PRIM_BG, colors.MID_BG, colors.END_BG]
  const [loading, setLoading] = useState(false)
  // const [showAdvanced, setShowAdvanced] = useState(false)
  const [errorMessages, setErrorMessages] = useState({
    email: '',
    company:''
  })
  const [dateOfBirth, setDateOfBirth] = useState()
  const [customTimeLogLimits, setCustomTimeLogLimits] = useState(true)
  const [maxWorkingHoursPerDay, setMaxWorkingHoursPerDay] = useState('8')
  const [maxWorkingHoursPerWeek, setMaxWorkingHoursPerWeek] = useState('40')
  const [keyboardShow, setKeyboardShow] = useState(false)
  const [showTimeZoneModal, setShowTimeZoneModal] = useState(false)
  const [selectedTimeZone, setSelectedTimeZone] = useState({ index: -1, value: 'UTC' })
  const [roleId, setRoleId] = useState(null)

  const goBack = () => {
    navigation.goBack()
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
    setLoading(true)
    api.group
      .getUser(id)
      .then((res) => {
        if (res?.success) {
          // console.log(res?.user, '----------user------------')
          res?.user?.email && setUserEmail(res?.user?.email)
          res?.user?.first_name && setUserName(res?.user?.first_name)
          res?.user?.last_name && setUserSurName(res?.user?.last_name)
          res?.user?.phone && setUserPhone(res?.user?.phone)
          res?.user?.image && setImage({ uri: res?.user?.image })
          res?.user?.client_company?.address && setUserAddress(res?.user?.client_company?.address)
          res?.user?.client_company?.website && setUserWebsite(res?.user?.client_company?.website)
          res?.user?.client_company &&
            setSelectedCompany({
              id: res?.user?.client_company?.id,
              name: res?.user?.client_company?.name,
            })

          // setUserActive(
          //   res?.user?.organization_user_role_setting?.user_status == 'active' ? true : false
          // )
        }
      })
      .catch((err) => {
        console.log(err.response.data)
      })
      .finally(() => setLoading(false))
  }, [isFocused])

  const openCompanyPicker = () => {
    setShowCompanyPickerModal(true)
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

  const updateClient = () => {

    if (hasCompanyPickerErrors(selectedCompany.name, setErrorMessages)) {
      return
    }
    const body = {
      method: 'PUT',
      email: userEmail,
      user_status: 'active',
      ucs_for_timelog_limit: 1,
      time_zone: 'UTC',
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



    setLoading(true)

    api.user
      .updateUserId(body, id)
      .then((res) => {
        navigation.navigate('ClientListScreen', { refetch: Math.random() })
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

  const { height, width } = Dimensions.get('window')

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.START_BG }}>
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
      <CompanyPickerModal
        visibility={showCompanyPickerModal}
        setVisibility={setShowCompanyPickerModal}
        selected={selectedCompany}
        setSelected={setSelectedCompany}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: colors.WHITE }}
        enabled={keyboardShow}
      >
        {/* <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss()
            setKeyboardShow(false)
          }}
        > */}
        <View
          style={[
            { flex: 1, justifyContent: 'space-between', paddingHorizontal: 16 },
            keyboardShow
              ? { marginBottom: 16 }
              : { marginBottom: Platform.OS === 'ios' && height > 670 ? 60 : 66 },
          ]}
        >
          <CMidHeaderWithIcons
            title={'Edit client Profile'}
            onPress={goBack}
            // containerStyle={{ paddingHorizental: 16 }}
          />
          <ScrollView style={s.container} keyboardShouldPersistTaps="always">
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
              label="Email"
              placeholder="Email"
              value={userEmail}
              setValue={setUserEmail}
              editable={false}
              // showErrorMessage
              // errorMessage={errorMessages.email}
              required
            />

            {/* <View style={g.moreContainerRight}>
                  <Text style={s.inputHeader}>{showAdvanced ? 'Hide ' : 'More '} Options</Text>
                  <IconWrap
                    onPress={() => {
                      setShowAdvanced((prev) => !prev)
                    }}
                    outputRange={iconWrapColors}
                  >
                    <DotsIcon fill={'dodgerblue'} />
                  </IconWrap>
                </View> */}
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

              <CSelectWithLabel
                label="Company"
                onPress={openCompanyPicker}
                selectText={selectedCompany.id != -1 ? selectedCompany.name : 'Select'}
                showErrorMessage={errorMessages.company !== ''}
                errorMessage={errorMessages.company}
              />

              <CInputWithLabel
                label="Address"
                placeholder="Address"
                value={userAddress}
                setValue={setUserAddress}
                editable={false}
              />

              <CInputWithLabel
                label="Website"
                placeholder="Website"
                value={userWebsite}
                setValue={setUserWebsite}
                editable={false}
              />
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
                disabled={true}
                retquired
              />
            </>
          </ScrollView>
          <CButtonInput label={'Save'} onPress={updateClient} />
        </View>
        {/* </TouchableWithoutFeedback> */}
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
    marginBottom: 16,
    // paddingHorizontal: 16,
    // marginBottom: 64,
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
    // marginTop: 0,
    marginVertical: 16,
  },
})
