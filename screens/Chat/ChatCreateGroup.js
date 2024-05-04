import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import CheckedIcon from '../../assets/svg/cbchecked.svg'
import PersonIcon from '../../assets/svg/person.svg'
import CheckedEmptyIcon from '../../assets/svg/cbempty.svg'
import CText from '../../components/common/CText'

import api from '../../api/api'

import CButtonInput from '../../components/common/CButtonInput'
import CSearchInput from '../../components/common/CSearchInput'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import { getErrorMessage, hasGroupNameErrors } from '../../utils/Errors'
import HideKeyboard from '../../components/common/HideKeyboard'

const iconWrapColors = [colors.END_BG, colors.MID_BG, colors.END_BG]
export default function ChatCreateGroup({ navigation, route }) {
  const channelData = route.params ? route.params?.channelData : null

  const [step, setStep] = useState('Select')
  const [members, setMembers] = useState([])
  const [groupName, setGroupName] = useState('')
  const [groupErrors, setGroupErrors] = useState('')
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [pdfDetails, setPdfDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState([])
  const [refetch, setRefetch] = useState(false)

  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  const checkIfSelected = (user) => {
    const found = selected.find((singleuser) => singleuser.id == user.id)
    return found
  }

  const toggleSelected = (user) => {
    if (checkIfSelected(user)) {
      setSelected((prev) => {
        const copy = [...prev]
        return copy.filter((singleuser) => user.id != singleuser.id)
      })
    } else {
      setSelected((prev) => [...prev, user])
    }
  }

  const MembersCard = ({ item, showSelection = true, presable=true}) => {
    return (
      <TouchableOpacity disabled={!presable} style={s.memberContainer} onPress={() => toggleSelected(item)}>
        <Image source={{ uri: item?.image }} style={s.memberImage} />
        <View style={s.memberDetails}>
          <Text style={s.memberName}>{item?.name ? item?.name : item?.email}</Text>
        </View>
        {showSelection && <>{checkIfSelected(item) ? <CheckedIcon /> : <CheckedEmptyIcon />}</>}
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  useEffect(() => {
    setLoading(true)
    const body = {
      allData: true,
    }
    if (query != '') {
      body['search'] = query
    }

    api.user
      .getUsers(body)
      .then((res) => {
        setMembers(res.members)
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
      .finally(() => {
        setLoading(false)
      })
  }, [query, refetch])

  const createGroup = () => {
    if (hasGroupNameErrors(groupName, setGroupErrors)) {
      return
    }
    if (selected.length == 0) {
      Alert.alert('Please select at least one member.')
      return
    }
    let body = {
      name: groupName,
      group_type: 'message',
      members: selected.map((user) => user?.id),
    }
    api.chat
      .createGroupMessage(body)
      .then((res) => {
        //console.log(res)
        if (res.success) {
          navigation.goBack()
        }
      })
      .catch((err) =>{
        
      } )
  }

  return (
    <HideKeyboard>
      <SafeAreaView style={g.safeAreaStyle}>
        <View style={[g.outerContainer, s.container]}>
          <View style={s.headerContainer}>
            <TouchableOpacity
              onPress={() => {
                if (step == 'New Group') {
                  setStep('Select')
                } else {
                  navigation.goBack()
                }
              }}
            >
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>
            <CText style={[g.title3, s.textColor]}>{step}</CText>
            <View></View>
          </View>
          {step == 'Select' && (
            <CSearchInput placeholder="Search" value={search} setValue={setSearch} isGSearch={true} searchIcon />
          )}
          {step == 'Select' && (
            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              renderItem={MembersCard}
              ListHeaderComponent={<View></View>}
              ListFooterComponent={
                loading && <ActivityIndicator size="small" color={colors.NORMAL} />
              }
            />
          )}
          {step == 'New Group' && (
            <View style={{ flex: 1 }}>
              <CInputWithLabel
                value={groupName}
                setValue={setGroupName}
                label="Group name"
                showLabel
                showErrorMessage
                errorMessage={groupErrors['name']}
                style={{
                  backgroundColor: colors.WHITE,
                }}
              />
              <FlatList
                data={selected}
                keyExtractor={(item) => item.id}
                renderItem={(props) => <MembersCard {...props} showSelection={false} presable={false} />}
                ListHeaderComponent={
                  <View>
                    <TouchableOpacity
                      style={[g.containerLeft, s.memberAddContainer]}
                      onPress={() => {
                        setStep('Select')
                      }}
                    >
                      <PersonIcon />
                      <Text style={s.memberAddText}>+ Add new member</Text>
                    </TouchableOpacity>
                  </View>
                }
                ListFooterComponent={
                  loading && <ActivityIndicator size="small" color={colors.NORMAL} />
                }
              />
            </View>
          )}
          <CButtonInput
            label={step == 'Select' ? 'Next' : 'Start Chat'}
            onPress={step == 'Select' ? () => setStep('New Group') : createGroup}
          />
        </View>
      </SafeAreaView>
    </HideKeyboard>
  )
}

const s = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  container: {
    paddingBottom: 64,
  },
  textColor: {
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  borderedIcon: {
    borderLeftColor: colors.SEC_BG,
    borderRightColor: colors.SEC_BG,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    paddingHorizontal: 32,
  },
  iconText: {
    color: colors.NORMAL,
    textAlign: 'center',
    paddingTop: 4,
    fontWeight: 'bold',
  },
  detailsPickerContainer: {
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    marginVertical: 16,
  },
  detailsPickerButton: {
    width: '50%',
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    paddingVertical: 8,
  },
  detailsPickerButtonActive: {
    backgroundColor: colors.ICON_BG,
  },
  detailsPickerButtonText: {
    color: colors.BLACK,
    fontSize: 16,
    textAlign: 'center',
  },
  detailsPickerButtonTextActive: {
    color: colors.WHITE,
    fontWeight: 'bold',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    height: 64,
    width: 64,
    borderRadius: 10,
    marginRight: 16,
  },
  pdfContainer: {
    height: 64,
    width: 64,
    borderRadius: 10,
    backgroundColor: '#D6E2FF',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    marginRight: 16,
  },
  memberContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.WHITE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginVertical: 8,
  },
  memberImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  memberDetails: {
    marginRight: 'auto',
  },
  memberName: {
    fontFamily: 'inter-regular',
    color: colors.NORMAL,
    fontWeight: 'bold',
    fontSize: 18,
  },
  memberRole: {
    fontFamily: 'inter-regular',
    color: colors.PRIM_CAPTION,
    fontWeight: 'bold',
    fontSize: 14,
  },
  memberAddContainer: {
    backgroundColor: colors.WHITE,
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  memberAddText: {
    color: colors.ICON_BG,
    marginLeft: 16,
    fontFamily: 'inter-regular',
  },
})
