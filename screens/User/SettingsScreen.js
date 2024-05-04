import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '../../assets/constants/colors'
import ArrowDownIcon from '../../assets/svg/arrow-down.svg'
import { useIsFocused } from '@react-navigation/native'
import NotificationIcon from '../../assets/svg/bell_2.svg'
import CardIcon from '../../assets/svg/card.svg'
import CompaniesIcon from '../../assets/svg/companies.svg'
import CustomizationIcon from '../../assets/svg/customization.svg'
import SubscriptionIcon from '../../assets/svg/dollar.svg'
import EditIcon from '../../assets/svg/edit.svg'
import LockIcon from '../../assets/svg/lock.svg'
import QuestionIcon from '../../assets/svg/question-icon.svg'
import RightArrowIcon2 from '../../assets/svg/right_arrow_2.svg'
import SettingsIcon from '../../assets/svg/settings.svg'
import CButton from '../../components/common/CButton'
import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'
import { setNormal } from '../../store/slices/tab'
import MoreIcon from '../../assets/svg/more.svg'
import UserIcon from '../../assets/svg/person.svg'

import g from '../../assets/styles/global'

import { useDispatch, useSelector } from 'react-redux'
import CButtonInput from '../../components/common/CButtonInput'
import { logout } from '../../store/slices/auth'
import ChangeCompanyModal from '../../components/modals/ChangeCompanyModal'

export default function SettingsScreen({ navigation }) {
  const { user, domain, domainIndex } = useSelector((state) => state.user)
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [gridView, setGridView] = useState(true)
  const [showCompanyChangeModal, setShowCompanyChangeModal] = useState(false)
  const handleGridViewToggle = () => {
    setGridView((prev) => !prev)
  }

  const handleLogout = async () => {
    await dispatch(logout())
  }
  const dispatch = useDispatch()
  const isFocused = useIsFocused()

  useEffect(() => {
    if (isFocused) dispatch(setNormal())
  }, [isFocused])


  const openCompanyChangeModal = () => {
    setShowCompanyChangeModal(true)
  }

  return (
    <SafeAreaView style={s.containerBG}>
      <ChangeCompanyModal
        visibility={showCompanyChangeModal}
        setVisibility={setShowCompanyChangeModal}
      />
      <ScrollView>
        <View style={[g.outerContainer, s.innerContainer]}>
          {/* <View style={[g.containerBetween, s.container]}>
            <View style={s.headerContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('UserProfileUpdateScreen')}>
                {user?.image && (
                  <Image source={{ uri: user?.image }} style={s.headerImage} />
                )}
              </TouchableOpacity>
              <View style={s.headerTitleContainer}>
                <Text style={s.headerGreeting}>Hello,</Text>
                <Text style={s.headerProfileText}>
                  {user?.name ? user?.name : `${user?.email && user?.email.split('@')[0]}`}
                </Text>
              </View>
            </View>

            <View>
              <IconWrap
                outputRange={iconWrapColors}
                onPress={() => navigation.navigate('UserProfileUpdateScreen')}
              >
                <EditIcon fill={colors.SECONDARY} width={22} height={22} />
              </IconWrap>
            </View>
          </View> */}

          <View style={[g.containerBetween, s.container]}>
            <View style={[s.headerContainer]}>
              <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                <Image source={{ uri: user?.image }} style={s.headerImage} />
              </TouchableOpacity>
              <View style={s.headerTitleContainer}>
                <Text style={s.headerProfileText}>
                  {user?.name ? user?.name : `${user?.email && user?.email?.split('@')[0]}`}
                </Text>
                <View style={g.containerLeft}>
                  <Text style={s.subHeaderText}>Company: </Text>
                  <TouchableOpacity
                    style={[g.containerLeft, s.companySelectorContainer]}
                    onPress={openCompanyChangeModal}
                  >
                    <Text style={s.subHeaderCompanyText}>
                      {domain.length > 15 ? domain.slice(0, 15) + '...' : domain}
                    </Text>
                    <ArrowDownIcon />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('UserProfileUpdateScreen')
                }}
              >
                <MoreIcon fill={colors.SECONDARY} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.mainContainerListView}>
            

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('MyProfile')
              }}
              style={s.mainItemContainerList}
            >
              <View style={s.mainItemContainerListLeft}>
                <View style={s.iconWrapperSmall}>
                  <UserIcon fill={colors.SECONDARY} width={22} height={22} />
                </View>
                <Text style={[s.mainItemListText]}>My Profile</Text>
              </View>
              <RightArrowIcon2 fill={'green'} width={10} height={12} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Security')
              }}
              style={s.mainItemContainerList}
            >
              <View style={s.mainItemContainerListLeft}>
                <View style={s.iconWrapperSmall}>
                  <LockIcon fill={colors.SECONDARY} width={22} height={22} />
                </View>
                <Text style={[s.mainItemListText]}>Security</Text>
              </View>
              <RightArrowIcon2 fill={'green'} width={10} height={12} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Preferences')
              }}
            >
              <View style={s.mainItemContainerList}>
                <View style={s.mainItemContainerListLeft}>
                  <View style={s.iconWrapperSmall}>
                    <SettingsIcon fill={colors.SECONDARY} width={22} height={22} />
                  </View>
                  <Text style={[s.mainItemListText]}>Preferences</Text>
                </View>
                <RightArrowIcon2 fill={'green'} width={10} height={12} />
              </View>
            </TouchableOpacity>


            {/* <TouchableOpacity
              onPress={() => {
                navigation.navigate('Subscriptions', {
                  screen: 'MyCards', params: {
                    organizationId: domainIndex,
                    fromSettings: true
                  }
                })
              }}
            >
              <View style={s.mainItemContainerList}>
                <View style={s.mainItemContainerListLeft}>
                  <View style={s.iconWrapperSmall}>
                    <CardIcon fill={colors.SECONDARY} width={22} height={22} />
                  </View>
                  <Text style={[s.mainItemListText]}>My Cards</Text>
                </View>
                <RightArrowIcon2 fill={'green'} width={10} height={12} />
              </View>
            </TouchableOpacity> */}

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('NotificationSettings')
              }}
            >
              <View style={s.mainItemContainerList}>
                <View style={s.mainItemContainerListLeft}>
                  <View style={s.iconWrapperSmall}>
                    <NotificationIcon fill={colors.SECONDARY} width={22} height={22} />
                  </View>
                  <Text style={[s.mainItemListText]}>Notification Settings</Text>
                </View>
                <RightArrowIcon2 fill={'green'} width={10} height={12} />
              </View>
            </TouchableOpacity>

            {/* <TouchableOpacity
              onPress={() => {
                // navigation.navigate('Home', { isEditDashboard: Math.random() })
              }}
            >
              <View style={s.mainItemContainerList}>
                <View style={s.mainItemContainerListLeft}>
                  <View style={s.iconWrapperSmall}>
                    <CustomizationIcon fill={colors.SECONDARY} width={22} height={22} />
                  </View>
                  <Text style={[s.mainItemListText]}>Integrations</Text>
                </View>
                <RightArrowIcon2 fill={'green'} width={10} height={12} />
              </View>
            </TouchableOpacity> */}

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Subscriptions')
              }}
              style={s.mainItemContainerList}
            >
              <View style={s.mainItemContainerListLeft}>
                <View style={s.iconWrapperSmall}>
                  <SubscriptionIcon fill={colors.SECONDARY} width={22} height={22} />
                </View>
                <Text style={[s.mainItemListText]}>Billing</Text>
              </View>
              <RightArrowIcon2 fill={'green'} width={10} height={12} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('SupportListScreen')
              }}
              style={[s.mainItemContainerList]}
            >
              <View style={s.mainItemContainerListLeft}>
                <View style={s.iconWrapperSmall}>
                  <QuestionIcon width={22} height={22} />
                </View>
                <Text style={[s.mainItemListText]}>Support</Text>
              </View>
              <RightArrowIcon2 fill={'green'} width={10} height={12} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Companies')
              }}
              style={[s.mainItemContainerList, { borderBottomWidth: 0 }]}
            >
              <View style={s.mainItemContainerListLeft}>
                <View style={s.iconWrapperSmall}>
                  <CompaniesIcon fill={colors.SECONDARY} width={22} height={22} />
                </View>
                <Text style={[s.mainItemListText]}>My Companies</Text>
              </View>
              <RightArrowIcon2 fill={'green'} width={10} height={12} />
            </TouchableOpacity>
          </View>
          <CButtonInput onPress={handleLogout} label={'Log out'} style={s.logoutButton} />
          <CButton style={{ backgroundColor: colors.LIGHT_GRAY }}>
            <CText style={[g.title3]}>Close the Account</CText>
          </CButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  containerBG: {
    flex: 1,
    backgroundColor: colors.CONTAINER_BG,
  },
  innerContainer: {
    marginBottom: 100,
    // borderWidth: 1
  },
  container: {
    paddingVertical: 15,
    // borderWidth: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  subHeaderCompanyText: {
    color: colors.NORMAL,
    fontFamily: 'inter-regular',
    fontWeight: '500',
  },
  headerTitleContainer: {
    paddingHorizontal: 10,
  },
  headerGreeting: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerProfileText: {
    fontSize: 20,
    fontWeight: '600',
  },
  companySelectorContainer: {
    marginTop: 4,
    borderBottomColor: colors.NORMAL,
    borderBottomWidth: 1,
    fontWeight: 'bold',
  },
  headerImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  subHeaderContainer: {
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.WHITE,
    borderRadius: 8,
  },
  subHeaderText: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '600',
    color: colors.HEADER_TEXT,
  },
  subHeaderTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexWrap: 'wrap',
    alignContent: 'space-around',
  },
  mainItemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '33.33%',
    marginBottom: 48,
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
  mainContainerListView: {
    marginBottom: 60,
  },
  mainItemContainerList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D6E2FF',
  },
  mainItemContainerListLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  iconWrapperSmall: {
    backgroundColor: colors.WHITE,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 6,
  },
  mainItemListText: {
    fontFamily: 'inter-regular',
    fontSize: 16,
    color: colors.HOME_TEXT,
    fontWeight: '500',
    marginLeft: 8,
    fontFamily: 'inter-semibold',
  },
  logoutButton: {
    marginVertical: 10,
  },
})
