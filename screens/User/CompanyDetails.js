import React, { useEffect, useState } from 'react'
import {
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import EditIcon from '../../assets/svg/edit.svg'
import LocationIcon from '../../assets/svg/location.svg'
import PhoneIcon from '../../assets/svg/phone.svg'
import SettingsIcon from '../../assets/svg/settings.svg'
import UrlIcon from '../../assets/svg/url.svg'

import { useIsFocused } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { Platform } from 'react-native'
import { useDispatch } from 'react-redux'
import CButtonInput from '../../components/common/CButtonInput'
import CHeaderWithTwoIcons from '../../components/common/CHeaderWithTwoIcons'
import IconWrap from '../../components/common/IconWrap'
import { setNormal } from '../../store/slices/tab'
import { getErrorMessage } from '../../utils/Errors'

export default function CompanyDetails({ navigation, route }) {
  const isFocused = useIsFocused()
  let id = route.params ? route.params.id : null
  let refetch = route.params ? route.params.refetch : null
  const [companyDetails, setCompanyDetails] = useState(null)
  const iconWrapColors = [colors.START_BG, colors.MID_BG, colors.END_BG]
  const [search, setSearch] = useState('')
  const [refresh, setRefresh] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const goBack = () => {
    navigation.navigate('Companies', { refetch: Math.random() })
  }

  useEffect(() => {
    const getCompanyDetails = async () => {
      api.company
        .getCompany(id)
        .then((res) => {
          if (res.success) {
            //console.log(res)
            const orgCopy = res.organization

            for (let key in orgCopy) {
              if (orgCopy[key] == 'null') {
                orgCopy[key] = ''
              }
            }
            setCompanyDetails(orgCopy)
          }
        })
        .catch((err) => {
          //console.log(err)
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
    }
    getCompanyDetails()
  }, [refresh, refetch])

  const toggleRefresh = () => {
    setRefresh((prev) => !prev)
  }

  const onRefresh = () => {
    toggleRefresh()
  }

  const dispatch = useDispatch()
  useEffect(() => {
    if (isFocused) dispatch(setNormal())
  }, [isFocused])

  return (
    <SafeAreaView
      style={[
        g.padding2x,
        s.containerBG,
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{
          flex: 1,
          justifyContent: 'space-between',
          marginBottom: 50,
          // paddingHorizontal: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          <CHeaderWithTwoIcons
            containerStyle={{ marginTop: 0 }}
            onPress={goBack}
            iconWrapColors={iconWrapColors}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('CompanySettings')
              }}
            >
              <SettingsIcon fill={colors.ICON_BG} />
            </TouchableOpacity>
          </CHeaderWithTwoIcons>

          {companyDetails && (
            <>
              <View style={s.container}>
                {/* <View style={s.imageContainer}>
                  <Image
                    source={{ uri: companyDetails.logo ? companyDetails.logo : null }}
                    style={{ width: 72, height: 72 }}
                  ></Image>
                </View> */}

                <TouchableOpacity style={s.container}>
                  <View style={s.imageContainer}>
                    {companyDetails.logo && (
                      <Image
                        source={{ uri: companyDetails.logo ? companyDetails.logo : null }}
                        style={{ width: 92, height: 92 }}
                      />
                    )}
                  </View>

                  <View style={s.editButtonContainer}>
                    <IconWrap
                      onPress={() => {
                        navigation.navigate('CompanyEdit', {
                          id: id,
                        })
                      }}
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

                <Text style={s.companyName}>
                  {companyDetails.name ? companyDetails.name : '[Add Company Name]'}
                </Text>
                <Text style={s.companyEmail}>
                  {companyDetails.email ? companyDetails.email : '[Add Company Email]'}
                </Text>
              </View>

              <View style={s.divider}></View>

              <View>
                <TouchableOpacity
                  onPress={() => {
                    companyDetails.address_line_1
                      ? Linking.openURL(
                          `http://maps.google.com/?q=${companyDetails.address_line_1.replace(
                            ' ',
                            '+'
                          )}`
                        )
                      : console.log('No address')
                  }}
                  style={[g.containerLeft, s.detailsContainer]}
                >
                  <LocationIcon />
                  <Text style={s.detailsText}>
                    {companyDetails.address_line_1
                      ? companyDetails.address_line_1
                      : '[Add Company Address]'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[g.containerLeft, s.detailsContainer]}
                  onPress={() =>
                    companyDetails.phone && Linking.openURL(`tel:${companyDetails.phone}`)
                  }
                >
                  <PhoneIcon />
                  <Text style={s.detailsText}>
                    {companyDetails.phone ? companyDetails.phone : '[Add Company Phone]'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[g.containerLeft, s.detailsContainer]}
                  onPress={() => companyDetails.website && Linking.openURL(companyDetails.website)}
                >
                  <UrlIcon />
                  <Text style={s.detailsText}>
                    {companyDetails.website ? companyDetails.website : '[Add Company Website]'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* <View style={[s.IconsContainer]}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('CompanySecurityScreen')
                }}

                style={{ alignItems: 'center', justifyContent: 'center' }}
              // style={s.mainItemContainer}
              >
                <View style={s.iconWrapperBig}><SecurityIcon /></View>
                <Text style={s.mainItemText}>Security</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('DirectoryScreen')}
                onLongPress={() => { }}
                style={{ alignItems: 'center', justifyContent: 'center' }}
              // style={s.mainItemContainer}
              >
                <View style={s.iconWrapperBig}><DirectoryIcon /></View>
                <Text style={s.mainItemText}>Directory</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { navigation.navigate('Roles', { id: id }) }}

                style={{ alignItems: 'center', justifyContent: 'center' }}
              // style={s.mainItemContainer}
              >
                <View style={s.iconWrapperBig}><RolesIcon /></View>
                <Text style={s.mainItemText}>Roles</Text>
              </TouchableOpacity>
            </View> */}
            </>
          )}
        </View>

        <View style={{ marginBottom: 16 }}>
          <CButtonInput
            label="Close the company"
            style={{ backgroundColor: colors.PRIM_CAPTION }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  containerBG: {
    backgroundColor: colors.WHITE,
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.CONTAINER_BG,
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
  // container: {
  //   width: '100%',
  //   alignItems: 'center',
  //   marginTop: 22,
  // },
  IconsContainer: {
    // borderWidth: 1,
    marginVertical: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    marginVertical: 24,
  },
  detailsText: {
    color: colors.NORMAL,
    fontSize: 16,
    marginLeft: 34,
  },
  detailsContainer: {
    marginVertical: 16,
    // marginHorizontal: 16,
  },
})
