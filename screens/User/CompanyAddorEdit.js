import { useIsFocused } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import EditIcon from '../../assets/svg/edit.svg'
import AutoCompletePLace from '../../components/common/AutoCompletePLace'
import CButtonInput from '../../components/common/CButtonInput'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import IconWrap from '../../components/common/IconWrap'
import TimeZoneModal from '../../components/modals/TimeZoneModal'
import { setNormal } from '../../store/slices/tab'
import { refreshCompanies } from '../../store/slices/user'
import { getImageFromPickedImage } from '../../utils/Attachmets'
import {
  getErrorMessage,
  hasCompanyAddressErrors,
  hasCompanyNameErrors,
  hasEmailErrors,
  hasTimeZoneErrors,
} from '../../utils/Errors'

export default function CompanyAddorEdit({ navigation, route }) {
  let id = route.params ? route.params.id : null
  let isEditing = route?.params?.id ? true : false
  const [dataLoaded, setDataLoaded] = useState(!isEditing)
  const scrollViewRef = useRef(null)
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [showTimeZoneModal, setShowTimeZoneModal] = useState(false)
  const [image, setImage] = useState({ uri: null })
  const [companyName, setCompanyName] = useState('')
  const [companyDomain, setCompanyDomain] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyAddressLine1, setCompanyAddressLine1] = useState('')
  const [companyAddressLine2, setCompanyAddressLine2] = useState('')
  const [companyAddressLine3, setCompanyAddressLine3] = useState('')
  const [companyCity, setCompanyCity] = useState('')
  const [companyState, setCompanyState] = useState('')
  const [companyZip, setCompanyZip] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [timeZoneIndex, setTimeZoneIndex] = useState({ index: -1 })
  const [timeZone, setTimeZone] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessages, setErrorMessages] = useState({
    domain: '',
    name: '',
    city: '',
    state: '',
    zip: '',
    website: '',
    phone: '',
    address: '',
    email: '',
    timezone: '',
    companyAddressLine1:''
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

    if (!result.canceled) {
      //console.log(result.assets[0].uri)
      setImage({ uri: result.assets[0].uri })
    }
  }

  const addOrUpdateCompany = () => {

    let body = {
      name: companyName,
      email: companyEmail,
      address_line_1: companyAddressLine1,
      phone: companyPhone,
      website: companyWebsite,
      zip_code: companyZip,
      time_zone: timeZoneIndex.index != -1 ? timeZoneIndex.item.value.slice(0, 10) : timeZone,
      state: companyState,
      city: companyCity,
    }
    if (image.uri) {
      // if the uri is a local uri , add it to the body

      if (!image.uri.includes('http')) {
        let formattedImage = getImageFromPickedImage(image)
        if (formattedImage) body['logo_image'] = formattedImage
      }
    }
    if (
      hasEmailErrors(companyEmail, setErrorMessages) ||
      hasCompanyNameErrors(companyName, setErrorMessages) ||
      hasTimeZoneErrors(timeZoneIndex.index, timeZone, setErrorMessages) ||
      hasCompanyAddressErrors(companyAddressLine1, setErrorMessages)
    ) {
      console.log(errorMessages,'company address line 1............')
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
      return
    }

    if (id) {
      body['_method'] = 'PUT'
      setLoading(true)
      api.company
        .updateCompany(body, id)
        .then((res) => {
          if (res.success) {
            navigation.navigate('CompanyDetails', { id: id, refetch: Math.random() })
            dispatch(refreshCompanies())
          }
        })
        .catch((err) => {
          //console.log(err.response)
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(true)
      api.company
        .createCompany(body)
        .then((res) => {
          if (res.success) {
            //console.log(res.subscription.id, res.subscription.organization_id)
            navigation.navigate('Subscriptions', {
              screen: 'CustomizePlan',
              params: {
                subscriptionId: res.subscription.id,
                organizationId: res.subscription.organization_id,
                justCreatedCompany: true,
              },
            })

            dispatch(refreshCompanies())
          }
        })
        .catch((err) => {
          console.log(err)
          console.log(err.response)
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
        .finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    const getCompanyDetails = async () => {
      api.company
        .getCompany(id)
        .then((res) => {
          if (res.success) {
            const {
              domain,
              name,
              email,
              logo,
              address_line_1,
              address_line_2,
              address_line_3,
              phone,
              website,
              zip_code,
              time_zone,
              state,
              city,
            } = res.organization

            if (domain != 'null') setCompanyDomain(domain)
            if (name != 'null') setCompanyName(name)
            if (city != 'null') setCompanyCity(city)
            if (state != 'null') setCompanyState(state)
            if (email != 'null') setCompanyEmail(email)
            if (phone != 'null') setCompanyPhone(phone)
            if (website != 'null') setCompanyWebsite(website)
            if (zip_code != 'null') setCompanyZip(zip_code)
            if (address_line_1 != 'null') {
              //console.log(address_line_1)
              setCompanyAddressLine1(address_line_1)
            }
            if (address_line_2 != 'null') setCompanyAddressLine2(address_line_2)
            if (address_line_3 != 'null') setCompanyAddressLine3(address_line_3)
            if (time_zone != 'null') setTimeZone(time_zone)
            if (logo) setImage({ uri: logo })
          }
        })
        .catch((err) => {})
        .finally(() => setDataLoaded(true))
    }
    if (id) getCompanyDetails()
  }, [])

  // for debugging
  // useEffect(() => {
  //   // //console.log({ companyAddressLine1 })
  //   // const city = companyAddressLine1.split(',')[1]
  //   //console.log({ companyCity })

  // }, [companyAddressLine1, companyCity])

  return (
    <SafeAreaView
      style={[
        { flex: 1, backgroundColor: colors.WHITE, width: '100%' },
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <TimeZoneModal
        visibility={showTimeZoneModal}
        setVisibility={setShowTimeZoneModal}
        selectedIndex={timeZoneIndex}
        setSelectedIndex={setTimeZoneIndex}
      />
      <View style={{ paddingHorizontal: 16 }}>
        <CHeaderWithBack
          title={id ? 'Edit Company' : 'Add new company'}
          onPress={goBack}
          iconWrapColors={iconWrapColors}
          labelStyle={{ textAlign: 'center', flex: 1, marginLeft: 0 }}
          containerStyle={{ marginTop: 0 }}
        />
      </View>
      <View style={{ marginBottom: 60, flex: 1, paddingHorizontal: 16 }}>
        <ScrollView
          style={[s.containerBG]}
          ref={scrollViewRef}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled={true}
          horizontal={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.innerContainer}>
            <TouchableOpacity style={s.container} onPress={pickImage}>
              <View style={s.imageContainer}>
                {image && <Image source={image} style={{ width: 92, height: 92 }} />}
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
            <CInputWithLabel
              value={companyName}
              setValue={setCompanyName}
              label="Company name"
              placeholder="Company Name"
              required
              showErrorMessage={errorMessages.name != ''}
              errorMessage={errorMessages.name}
            />

            <CInputWithLabel
              value={companyEmail}
              setValue={setCompanyEmail}
              label="Email"
              placeholder="Email"
              required
              showErrorMessage={errorMessages.email != ''}
              errorMessage={errorMessages.email}
            />
            <CInputWithLabel
              value={companyPhone}
              setValue={setCompanyPhone}
              label="Phone"
              placeholder="Phone"
            />
            {/* <View style={s.divider}></View> */}

            <ScrollView
              horizontal={true}
              style={{ width: '100%', flex: 1, flexDirection: 'column', marginVertical: 10 }}
              keyboardShouldPersistTaps="always"
            >
              <View style={{ flex: 1, width: '100%' }}>
                <Text style={s.labelStyle}>Address</Text>
                <AutoCompletePLace
                  setValue={setCompanyAddressLine1}
                  value={companyAddressLine1}
                  setLocality={setCompanyCity}
                  setState={setCompanyState}
                  setPostalCode={setCompanyZip}
                  placeholder={'Address'}
                  type=""
                />
                {errorMessages?.companyAddressLine1 !== "" ? <Text style={[s.errorMessage]}>{errorMessages?.companyAddressLine1}</Text>:<></>}
              </View>
            </ScrollView>

            <ScrollView
              horizontal={true}
              style={{ width: '100%', flex: 1, marginTop: 10, flexDirection: 'column' }}
              keyboardShouldPersistTaps="always"
            >
              <View style={{ flex: 1, width: '100%' }}>
                <Text style={s.labelStyle}>City</Text>
                <AutoCompletePLace
                  setValue={setCompanyCity}
                  value={companyCity}
                  placeholder={'City'}
                  type="cities"
                />
              </View>
            </ScrollView>

            <ScrollView
              horizontal={true}
              style={{ width: '100%', flex: 1, flexDirection: 'column', marginVertical: 10 }}
              keyboardShouldPersistTaps="always"
            >
              <View style={{ flex: 1, width: '100%' }}>
                <Text style={s.labelStyle}>State</Text>
                <AutoCompletePLace
                  setValue={setCompanyState}
                  value={companyState}
                  placeholder={'State'}
                  type="regions"
                />
              </View>
            </ScrollView>

            <CInputWithLabel
              value={companyZip}
              setValue={setCompanyZip}
              label="Zip"
              placeholder="___ __ __ ___ ___"
            />

            <CInputWithLabel
              value={companyWebsite}
              setValue={setCompanyWebsite}
              label="Website"
              placeholder="www."
            />
            <CSelectWithLabel
              onPress={() => setShowTimeZoneModal(true)}
              required
              errorMessage={errorMessages.timezone}
              showErrorMessage
              label="Time zone"
              selectText={
                timeZoneIndex.index != -1
                  ? timeZoneIndex.item.value
                  : timeZone != ''
                    ? timeZone
                    : 'Select'
              }
            />

            {/* <Text style={s.timeZoneText}></Text> */}
          </View>
        </ScrollView>

        <CButtonInput label="Save" onPress={addOrUpdateCompany} loading={loading} />
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  containerBG: {
    backgroundColor: colors.WHITE,
    width: '100%',
    flex: 1,
  },
  innerContainer: {
    // marginBottom: 120,
    width: '100%',
    // flex: 1,
    // backgroundColor: 'red'
  },
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 22,
  },
  imageContainer: {
    width: 92,
    height: 92,
    borderRadius: 46,
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
  companyName: {
    textAlign: 'center',
    color: colors.NORMAL,
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 20,
  },
  companyEmail: {
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
    // marginBottom: 16,
    fontWeight: 'bold',
    fontFamily: 'inter-regular',
    fontSize: 16,
  },
  labelStyle: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 12,
    color: colors.RED_NORMAL,
    marginTop: 4,
  },
})
