import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import MoreIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'

import { useKeyboard } from '@react-native-community/hooks'
import { Alert } from 'react-native'
import api from '../../api/api'
import CCheckbox from '../../components/common/CCheckbox'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CSearchInput from '../../components/common/CSearchInput'
import CText from '../../components/common/CText'
import CDetailsSettingModal from '../../components/modals/CDetailsSettingModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import TeamAssignModal from '../../components/modals/TeamAssignModal'
import { getErrorMessage } from '../../utils/Errors'

const UserCard = ({ props, checkIfSelected, toggleSelected, navigation, isLead }) => {
  const { item } = props
  const [checked, setChecked] = useState(false)
  const onChecked = () => {
    toggleSelected(item)
  }

  return (
    <View style={[s.cardContainer, g.containerBetween]}>
      <TouchableOpacity
        style={g.containerLeft}
        onPress={() => {
          // navigation.navigate('UserDetailsScreen', { user: item })
        }}
      >
        <Image source={{ uri: item.image }} style={s.profileImage} />
        <View>
          <Text style={g.body1}>
            {item?.name || (item.email.length > 15 ? item?.email.slice(0, 15) : item?.email)}
          </Text>
          {isLead && (
            <Text style={[g.caption1, { color: colors.PRIM_CAPTION }]}>{'Team Lead'}</Text>
          )}
          <View style={g.containerLeft}></View>
        </View>
      </TouchableOpacity>
      <CCheckbox
        showLabel={false}
        checked={checked}
        setChecked={setChecked}
        onChecked={onChecked}
      />
    </View>
  )
}

export default function TeamDetailsScreen({ navigation, route }) {
  const id = route.params ? route.params?.id : null
  const refetch = route.params ? route.params?.refetch : null
  const [teamDetails, setTeamDetails] = useState({})
  const [members, setMembers] = useState([])
  const [showableMembers, setShowableMembers] = useState([])
  const [teamLead, setTeamLead] = useState(null)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [btnLoader, setBtnLoader] = useState(false)
  const [memberLoader, setMemberLoader] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [keyboardShow, setKeyboardShow] = useState('')
  const keyboard = useKeyboard()
  const {
    coordinates: {
      end: { screenY },
      start,
    },
    keyboardHeight,
    keyboardShown,
  } = keyboard

  const checkIfSelected = (user) => {
    const found = selectedUsers.find((singleuser) => singleuser.id == user.id)
    return found
  }

  const toggleSelected = (user) => {
    if (checkIfSelected(user)) {
      setSelectedUsers((prev) => {
        const copy = [...prev]
        return copy.filter((singleuser) => user.id != singleuser.id)
      })
    } else {
      setSelectedUsers((prev) => [...prev, user])
    }
  }

  useEffect(() => {
    const getTeamDetails = async () => {
      if (!id) return
      setLoading(true)
      api.team
        .getTeam(id)
        .then((res) => {
          if (res.success) {
            setTeamDetails(res?.data)
            setMembers(res?.data?.user_members)
            // setShowableMembers(res?.data?.user_members)
            setTeamLead(res?.data?.user_lead)
            // //console.log(res, '000000000000')
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

    getTeamDetails()
  }, [refetch, refresh])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  useEffect(() => {
    if (query !== '') {
      setMemberLoader(true)
      let filteredMembers = members?.filter((member) => {
        return (
          member?.first_name?.toLowerCase().includes(query) ||
          member?.last_name?.toLowerCase().includes(query) ||
          member?.email?.toLowerCase().includes(query)
        )
      })
      // console.log(filteredMembers, 'filter memebers......')
      setShowableMembers(filteredMembers)
      setMemberLoader(false)
    } else {
      setShowableMembers(members)
      setMemberLoader(false)
    }
  }, [query, members])

  // useEffect(() => {
  //   const getTeamMembers = async () => {
  //     if (!id) return
  //     let body = {}
  //     if (query != '') {
  //       body['search'] = query
  //     }
  //     api.team
  //       .getTeamMembers(id, body)
  //       .then((res) => {
  //         if (res.success) {
  //           console.log(res, '99999999999999')
  //           // //console.log(res, '000000000000')
  //         }
  //       })
  //       .catch((err) => {
  //         let errorMsg = ''
  //         try {
  //           errorMsg = getErrorMessage(err)
  //         } catch (err) {
  //           errorMsg = 'An error occured. Please try again later.'
  //         }
  //         Alert.alert(errorMsg)
  //       })
  //       .finally(() => {
  //         // setLoading(false)
  //       })
  //   }

  //   getTeamMembers()
  // }, [refetch, refresh, query])

  const onDeleteTeam = async () => {
    try {
      setBtnLoader(true)
      let res = await api.team.deleteTeam(id)
      if (res.success) {
    
        navigation.navigate('Teams', { refetch: Math.random() })
      }
    } catch (error) {
      //console.log(error,'error....')
    } finally {
      setBtnLoader(false)
    }
  }

  const openDeleteModal = () => {
    setShowDeleteModal(true)
  }

  const { height, width } = Dimensions.get('window')

  return (
    <SafeAreaView
      style={[
        { flex: 1, backgroundColor: colors.CONTAINER_BG, width: '100%' },
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // keyboardVerticalOffset={100}
        style={[{ flex: 1, backgroundColor: colors.CONTAINER_BG, height: '100%' }]}
        enabled={keyboardShow}
      > */}
      <TeamAssignModal
        openModal={showAssignmentModal}
        setOpenModal={setShowAssignmentModal}
        teamDetails={teamDetails}
        setRefresh={setRefresh}
        onAssignMember={() => navigation.navigate('TeamAssignScreen', { id: id })}
      />

      <CDetailsSettingModal
        visibility={showSettingsModal}
        setVisibility={setShowSettingsModal}
        onEdit={() => navigation.navigate('TeamAddOrEditScreen', { id: id })}
        // onMove={() => setShowMoveModal(true)}
        onDelete={() => setShowDeleteModal(true)}
        // onClone={() => setShowCloneModal(true)}
      />
      <DeleteConfirmationModal
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        onDelete={onDeleteTeam}
        confirmationMessage={'Do you want to delete this Team?'}
        btnLoader={btnLoader}
      />

      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss()
          setKeyboardShow(false)
        }}
      >
        <View
          style={[
            s.outerPadding,
            { marginBottom: Platform.OS === 'ios' ? (height > 670 ? 54 : 54) : 54 },
          ]}
          onStartShouldSetResponder={() => !keyboardShow}
        >
          <View style={s.headerContainer}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack()
              }}
            >
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>
            <CText style={[g.title3, s.textColor]}>Details</CText>
            <View style={s.buttonTeam}>
              <TouchableOpacity
                onPress={() => setShowSettingsModal(true)}
                // onPress={() => navigation.navigate('TeamAddOrEditScreen', { id: id })}
                style={s.buttonTeamBtn}
              >
                <MoreIcon fill={colors.NORMAL} />
              </TouchableOpacity>
            </View>
          </View>
          {loading && (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={colors.HOVER} />
            </View>
          )}

          {!loading && (
            <View style={{ flex: 1 }}>
              <Text style={g.h3}>{teamDetails?.name}</Text>
              <CSearchInput
                placeholder="Search"
                value={search}
                setValue={setSearch}
                isGSearch={true}
                searchIcon={true}
                // removing search value
                onPress={() => setSearch('')}
              />
              <ScrollView
                nestedScrollEnabled={true}
                contentContainerStyle={[
                  { width: '100%', paddingBottom: 16 },
                  keyboardShown && { paddingBottom: keyboardHeight - 64 },
                ]}
              >
                <View onStartShouldSetResponder={() => !keyboardShow}>
                  {teamLead && (
                    <UserCard
                      props={{ item: teamLead }}
                      navigation={navigation}
                      checkIfSelected={checkIfSelected}
                      toggleSelected={toggleSelected}
                      isLead={true}
                    />
                  )}
                  {!memberLoader && (
                    <ScrollView
                      horizontal={true}
                      contentContainerStyle={{ width: '100%' }}
                      onStartShouldSetResponder={true}
                    >
                      <FlatList
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                        data={showableMembers}
                        keyExtractor={(item) => item.id}
                        renderItem={(props) => (
                          <UserCard
                            props={props}
                            navigation={navigation}
                            checkIfSelected={checkIfSelected}
                            toggleSelected={toggleSelected}
                          />
                        )}
                        containerStyle={{
                          flex: 1,
                          flexDirection: 'row',
                          paddingHorizontal: 16,
                        }}
                        ListEmptyComponent={
                          !teamLead &&
                          showableMembers.length == 0 && (
                            <Text>No members found. Add members by pressing the edit button.</Text>
                          )
                        }
                        ListFooterComponent={() =>
                          memberLoader && (
                            <View
                              style={{
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'center',
                              }}
                            >
                              <ActivityIndicator size="small" color={colors.HOVER} />
                            </View>
                          )
                        }
                      />
                    </ScrollView>
                  )}
                </View>
              </ScrollView>
            </View>
          )}

          <CFloatingPlusIcon
            onPress={() => navigation.navigate('TeamAssignScreen', { id: id })}
            style={{ bottom: 0 }}
          />
        </View>
      </TouchableWithoutFeedback>
      {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  outerPadding: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    justifyContent: 'space-evenly',
    // marginBottom: 64,
  },
  textColor: {
    color: colors.HEADING,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
  },
  profileImage: { width: 44, height: 44, marginRight: 16, borderRadius: 22 },
})
