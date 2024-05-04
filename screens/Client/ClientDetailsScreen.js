import { useIsFocused } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
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
import EditIcon from '../../assets/svg/edit.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import EmailIcon from '../../assets/svg/user-email.svg'
import MessageIcon from '../../assets/svg/user-message.svg'
import SmsIcon from '../../assets/svg/user-sms.svg'

export default function ClientDetailsScreen({ navigation, route }) {
  const id = route.params ? route.params?.id : null
  // console.log(id,'Id..........')
  const groupId = route.params ? route.params?.groupId : null
  const isFocused = useIsFocused()
  const [userActive, setUserActive] = useState(false)
  const [stack, setStack] = useState('details')
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(false)

  const goBack = () => {
    navigation.goBack()
  }

  useEffect(() => {
    setLoading(true)
    api.group
      .getUser(id)
      .then((res) => {
        if (res?.success) {
          setUser(res?.user)
          setUserActive(
            res?.user?.organization_user_role_setting?.user_status == 'active' ? true : false
          )
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
      })
      .finally(() => setLoading(false))
  }, [isFocused])

  return (
    <SafeAreaView style={g.safeAreaStyle}>
      <View style={[g.outerContainer, { paddingBottom: 64 }]}>
        <View style={[s.headerContainer]}>
          <TouchableOpacity
            onPress={() => {
              goBack()
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>

          <Text style={[g.body1]}>Client Profile</Text>
          <TouchableOpacity
            style={s.buttonGroup}
            onPress={() => {
              navigation.navigate('ClientEditScreen', { id: id })
            }}
          >
            <EditIcon fill={colors.NORMAL} />
          </TouchableOpacity>
        </View>

        {!loading && (
          <View style={{ flex: 1 }}>
            <View style={[g.containerLeft]}>
              <Image
                source={{ uri: user?.image ? user?.image : null }}
                style={s.profileImage}
              ></Image>
              <View style={{flex:1}}>
                <View style={{flexDirection:'row', width:'100%'}}>
                  <Text style={s.companyName}>
                    {user.name ? user.name : user.email}
                  </Text>
                </View>
                <View style={[g.containerLeft, s.messageContainer]}>
                  <TouchableOpacity>
                    <MessageIcon />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Linking.openURL('sms:' + user.phone)}>
                    <SmsIcon />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Linking.openURL('mailto:' + user.email)}>
                    <EmailIcon />
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
                  Activity
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingBottom: 64 }}>
              {stack == 'details' && (
                <>
                  <View style={s.spaceBelow}>
                    <Text style={s.sectionLabelText}>Email:</Text>
                    <Text style={s.sectionValueText}>{user.email}</Text>
                  </View>

                  <View style={s.spaceBelow}>
                    <Text style={s.sectionLabelText}>Phone number:</Text>
                    <Text style={s.sectionValueText}>{user.phone ? user.phone : ''}</Text>
                  </View>

                  <View style={s.divider}></View>
                  <View style={s.spaceBelow}>
                    <Text style={s.sectionLabelText}>Company:</Text>
                    <Text style={s.sectionValueText}>{user?.client_company?.name || ''}</Text>
                  </View>

                  <View style={s.spaceBelow}>
                    <Text style={s.sectionLabelText}>Website:</Text>
                    <Text style={s.sectionValueText}>{user?.client_company?.website || ''}</Text>
                  </View>

                  <View style={s.spaceBelow}>
                    <Text style={s.sectionLabelText}>Address:</Text>
                    <Text style={s.sectionValueText}>{user?.client_company?.address || ''}</Text>
                  </View>

                  <View style={s.spaceBelow}>
                    <Text style={s.sectionLabelText}>Birth date:</Text>
                    <Text style={s.sectionValueText}>{user.dob || ''}</Text>
                  </View>

                  <View style={s.spaceBelow}>
                    <Text style={s.sectionLabelText}>Time zone:</Text>
                    <Text style={s.sectionValueText}>{user.time_zone || ''}</Text>
                  </View>

                  {/* <View style={s.spaceBelow}>
                    <Text style={s.sectionLabelText}>Role:</Text>
                    <Text style={s.sectionValueText}>
                      {user?.organization_user_role_setting?.role?.name}
                    </Text>
                  </View> */}

                  {/* <Text style={s.sectionLabelText}>Licenses ( 4 of 50 available ) </Text> */}
                  {/* <View style={[g.containerLeft, g.marginVertical1x]}>
                    <ToggleSwitch
                      isOn={userActive}
                      onColor={colors.IN_PROGRESS_BG}
                      offColor={colors.SEC_BG}
                      labelStyle={{ color: 'black', fontWeight: '900' }}
                      size="medium"
                      onToggle={(isOn) => setUserActive(isOn)}
                      animationSpeed={150}
                    />
                    <Text style={s.textStyle}>{userActive ? 'Enabled' : 'Disabled'} </Text>
                  </View> */}

                  {/* <View style={s.divider}></View>
                  <View style={s.spaceBelow}>
                    <Text style={s.sectionLabelText}>Company:</Text>
                    <Text style={s.sectionValueText}></Text>
                  </View>
                  <View style={s.spaceBelow}>
                    <Text style={s.sectionLabelText}>Website:</Text>
                    <Text style={s.sectionValueText}></Text>
                  </View>
                  <View style={s.divider}></View>
                  <View style={s.spaceBelow}>
                    <Text style={s.sectionLabelText}>Date of Birth</Text>
                    <Text style={s.sectionValueText}>{user?.dob}</Text>
                  </View> */}
                </>
              )}
            </ScrollView>
          </View>
        )}
        {loading && <ActivityIndicator size={'large'} color={colors.NORMAL} />}
      </View>
      {/* <CFloatingPlusIcon onPress={() => navigation.navigate('UserAssignScreen')} /> */}
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
    fontWeight: '700',
    fontSize: 20,
    flex:1,
    width:'100%',
  },
  companyEmail: {
    textAlign: 'center',
    color: colors.NORMAL,
    fontSize: 16,
  },
  divider: {
    borderBottomColor: colors.SEC_BG,
    borderBottomWidth: 1,
    // marginTop: 0,
    marginVertical: 16,
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
  sectionLabelText: { color: colors.PRIM_CAPTION, fontSize: 12 },
  sectionValueText: { fontSize: 16, fontWeight: 'bold', color: colors.NORMAL, marginTop: 4 },
  spaceBelow: { marginBottom: 16 },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
})
