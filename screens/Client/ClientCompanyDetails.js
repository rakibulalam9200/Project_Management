import * as Linking from 'expo-linking'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import MoreIcon from '../../assets/svg/more.svg'
import PlusButton from '../../assets/svg/plus-blue-fill.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import EmailIcon from '../../assets/svg/user-email.svg'
import MessageIcon from '../../assets/svg/user-message.svg'
import SmsIcon from '../../assets/svg/user-sms.svg'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CDetailsSettingModal from '../../components/modals/CDetailsSettingModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import CompanyClients from './CompanyClients'

// const Activity = () => {}
export default function ClientCompanyDetailsScreen({ navigation, route }) {
  const userId = route.params ? route.params?.userId : null
  const id = route.params ? route.params.id : null
  const refetch = route.params ? route.params.refetch : null

  // console.log(id, '---------id---------------')
  // const { name, address, email, client_counts, logo, phone, website, id } = route.params
  //   ? route.params?.company
  //   : {}
  const [stack, setStack] = useState('details')
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [loading, setLoading] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [image, setImage] = useState({ uri: null })

  const goBack = () => {
    navigation.goBack()
  }

  useEffect(() => {
    const getClientCompanyDetails = async () => {
      api.clientCompany
        .getSingleClientCompany(id)
        .then((res) => {
          if (res.success) {
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
            if (logo) {
              setImage({ uri: logo +'?' + new Date()})
            }
          }
        })
        .catch((err) => {})
    }
    id && getClientCompanyDetails()
  }, [id,refetch])

  const attemptDelete = async () => {
    try {
      setBtnLoading(true)
      let res = await api.clientCompany.deleteClientCompany(id)
      // //console.log(res)
      if (res.success) {
        navigation.navigate('ClientCompanyScreen', { refetch: Math.random() })
        Alert.alert('Delete Successful.')
      }
    } catch (err) {
      // //console.log(err.response)
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        // //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
    } finally {
      setBtnLoading(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <SafeAreaView style={g.safeAreaStyle}>
      <CDetailsSettingModal
        visibility={showSettingsModal}
        setVisibility={setShowSettingsModal}
        onEdit={() => navigation.navigate('ClientCompanyEdit', { id: id })}
        onDelete={() => setShowDeleteModal(true)}
      />
      <DeleteConfirmationModal
        confirmationMessage={'Do you want to delete this Client Company? This cannot be undone'}
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        onDelete={attemptDelete}
        btnLoader={btnLoading}
      />
      <View style={[g.outerContainer, { paddingBottom: 64 }]}>
        <View style={[s.headerContainer]}>
          <TouchableOpacity
            onPress={() => {
              goBack()
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>

          <Text style={[g.body1]}>Client Company Profile</Text>
          <TouchableOpacity
            style={s.buttonGroup}
            onPress={() => {
              setShowSettingsModal(true)
            }}
          >
            <MoreIcon fill={colors.NORMAL} />
          </TouchableOpacity>
        </View>
        {/* <CHeaderWithBack title={'Client Company Profile'} onPress={goBack} /> */}

        {!loading && (
          <>
            <View style={[g.containerLeft]}>
              <Image source={image} style={s.profileImage}></Image>
              <View>
                <Text style={s.companyName}>{name}</Text>
                <View style={[g.containerLeft, s.messageContainer]}>
                  <TouchableOpacity>
                    <MessageIcon />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Linking.openURL('sms:' + phone)}>
                    <SmsIcon />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Linking.openURL('mailto:' + email)}>
                    <EmailIcon />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('UserAssignScreen',{ id: id })}>
                    <PlusButton />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={g.stackContainer}>
              <TouchableOpacity
                style={[g.stackButton, stack === 'details' ? g.stackButtonActive : null]}
                onPress={() => {
                  setStack('details')
                }}
              >
                <Text
                  style={[g.stackButtonText, stack === 'details' ? g.stackButtonTextActive : null]}
                >
                  Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[g.stackButton, stack === 'activity' ? g.stackButtonActive : null]}
                onPress={() => {
                  setStack('activity')
                }}
              >
                <Text
                  style={[g.stackButtonText, stack === 'activity' ? g.stackButtonTextActive : null]}
                >
                  Clients
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1,width: "100%" }} nestedScrollEnabled={true}>
              {stack == 'details' ? (
                <>
                  <View style={s.spaceBelow}>
                    <Text style={s.sectionLabelText}>Email:</Text>
                    <Text style={s.sectionValueText}>{email}</Text>
                  </View>

                  <View style={s.spaceBelow}>
                    <Text style={s.sectionLabelText}>Phone number:</Text>
                    <Text style={s.sectionValueText}>{phone}</Text>
                  </View>

                  <View style={s.spaceBelow}>
                    <Text style={s.sectionLabelText}>Address:</Text>
                    <Text style={s.sectionValueText}>{address}</Text>
                  </View>
                  <View style={s.spaceBelow}>
                    <Text style={s.sectionLabelText}>Website:</Text>
                    <Text style={s.sectionValueText}>{website}</Text>
                  </View>
                </>
              ) : (
                <CompanyClients navigation={navigation} route={route} companyId={id} />
              )}
            </ScrollView>
          </>
        )}
        {
          !loading && stack !== 'details'  && <CFloatingPlusIcon
            onPress={() => {
              navigation.navigate('ClientAddScreen',{company:{name:name,id:id}})
            }}
          />
        }
        {loading && <ActivityIndicator size={'large'} color={colors.NORMAL} />}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  textStyle: {
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.NORMAL,
    marginLeft: 4,
  },
  iconWrapperBig: {
    backgroundColor: colors.WHITE,
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },
  profileImage: { width: 100, height: 100, marginRight: 16, borderRadius: 50 },
  mainItemText: {
    fontFamily: 'inter-regular',
    fontSize: 16,
    paddingTop: 10,
    color: colors.HOME_TEXT,
    fontWeight: 'bold',
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  messageContainer: {
    marginVertical: 16,
    gap: 16,
  },

  IconsContainer: {
    // borderWidth: 1,
    marginVertical: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    textAlign: 'left',
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
    marginVertical: 24,
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
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  sectionLabelText: { color: colors.PRIM_CAPTION, fontSize: 12 },
  sectionValueText: { fontSize: 16, fontWeight: 'bold', color: colors.NORMAL,flex:1,flexDirection:'row' },
  spaceBelow: { marginBottom: 32 },
})
