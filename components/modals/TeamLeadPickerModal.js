import React, { useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSearchInput from '../../components/common/CSearchInput'

import { useEffect } from 'react'
import api from '../../api/api'

import { Image } from 'react-native'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import { getErrorMessage } from '../../utils/Errors'
import { abbreviateString } from '../../utils/Strings'
import { getAssignableIdsObjFromSelectedUsers } from '../../utils/User'
import CButtonInput from '../common/CButtonInput'

export default function TeamLeadPickerModal({
  visibility,
  setVisibility,
  selected,
  setSelected,
  isMultiplePicker = false,
  label,
  onUpdate = null,
  teamLead,
  selectedMembers,
  closeParentModal,
  navigationFrom,
  setRefresh,
  id,
}) {
  
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const checkIfSelected = (user) => {
      //console.log(selected?.id, user?.id)
      return selected?.id == user?.id
    
  }

  const toggleSelected = (user) => {
      if (user.id == selected?.id) {
        setSelected({ id: -1 })
      } else {
        setSelected(user)
      }
    
  }

  const closeModal = () => {
    setVisibility(false)
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
    if (label === 'Members') {
      body['role_name'] = 'Member'
    }
    api.user
      .getUsers(body)
      .then((res) => {
        // //console.log(res)

          if (!isMultiplePicker) {
            // console.log('hit here........',teamLead)
            // setSelected(teamLead)
            if(selectedMembers?.length === 0){
              setUsers(res?.members)
            }else{
              let filteredMembers =   res?.members.filter(member=> {
                return !selectedMembers.some(item => item.id === member.id);
              })
              setUsers(filteredMembers)
            }
          } else {
            setUsers(res?.members)
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
      .finally(() => {
        setLoading(false)
      })
  }, [query, teamLead,selectedMembers])

  const UserCard = ({ item }) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[g.containerBetween, s.modalInnerContainer]}
        onPress={() => toggleSelected(item)}
      >
        <Image source={{ uri: item?.image }} style={s.userImage} />
        <Text>
          {item.name ? abbreviateString(item.name, 30) : abbreviateString(item.email, 30)}
        </Text>

        {checkIfSelected(item) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
       
      </TouchableOpacity>
    )
  }

  const assignMemberToTeam = async () => {
    setLoading(true)
    let assignableIds = getAssignableIdsObjFromSelectedUsers(users)
    let body = {
      type: 'Member',
      state: 'team',
      assignable_ids: assignableIds,
      model_ids: [id],
    }

    // //console.log(body,'body.....')

    api.user
      .assignMemeber(body)
      .then((res) => {
        // //console.log(res,'res...........')
        closeModal()
        setRefresh((pre) => !pre)
      })
      .catch((err) => {
        // //console.log(err, '000000000000000')
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
  }
  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={g.modalOuterContainer}>
        <CHeaderWithBack
          onPress={() => {
            closeModal()
            if (navigationFrom === 'teamAssign') {
              closeParentModal()
            }
          }}
          title={'Select'}
          labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
          iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
          containerStyle={{ marginTop: 8 }}
        />
        <CSearchInput placeholder="Search" value={search} setValue={setSearch} filterIcon />

        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={UserCard}
          ListHeaderComponent={loading && <ActivityIndicator size="small" color={colors.NORMAL} />}
        />

        <CButtonInput
          label="Save"
          loading={loading}
          onPress={() => {
            if (navigationFrom == 'teamAssign') {
              // //console.log("hit here....")
              assignMemberToTeam()
              closeParentModal()
            }
            closeModal()
          }}
          style={s.bottomButton}
        />
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,

    paddingBottom: 56,
  },
  modalInnerContainer: {
    backgroundColor: colors.WHITE,
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  userImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  bottomButton: {
    marginVertical: 8,
  },
})
