import * as ImagePicker from 'expo-image-picker'
import React, { useEffect, useState } from 'react'
import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import EditIcon from '../../assets/svg/edit.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import CText from '../../components/common/CText'

import { useRef } from 'react'
import { Alert, KeyboardAvoidingView } from 'react-native'
import api from '../../api/api'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import IconWrap from '../../components/common/IconWrap'
import TeamUserPickerModal from '../../components/modals/TeamUserPickerModal'
import { getImageFromPickedImage } from '../../utils/Attachmets'
import { getErrorMessage, hasLeadPickerError, hasTeamNameErrors } from '../../utils/Errors'
import { getMembersObjFromSelectedUsers } from '../../utils/User'

const UserCard = ({ item, toggleSelected, navigation, isLead }) => {
  // console.log(isLead,'.......isLead...........')
  // const { item } = props
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
            {item?.name || (item?.email.length > 15 ? item?.email.slice(0, 15) : item?.email)}
          </Text>
          {isLead && (
            <Text style={[g.caption1, { color: colors.PRIM_CAPTION }]}>{`Team lead`}</Text>
          )}
          <View style={g.containerLeft}></View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleSelected ? () => toggleSelected(item) : null}>
        <DeleteIcon />
      </TouchableOpacity>
    </View>
  )
}

export default function TeamAddOrEditScreen({ navigation, route }) {
  const scrollViewRef = useRef(null)
  const id = route.params ? route.params?.id : null
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [teamName, setTeamName] = useState('')
  const [teamLead, setTeamLead] = useState(null)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [image, setImage] = useState({ uri: null })
  const [loading, setLoading] = useState(false)
  const [onUpdateImage, setOnUpdateImage] = useState(Math.random())
  const [keyboardShow, setKeyboardShow] = useState(false)
  const [showTeamLeadPicker, setShowTeamLeadPicker] = useState(false)
  const [showMembersPicker, setShowMembersPicker] = useState(false)
  const [teamDescription, setTeamDescription] = useState('')
  const [errorMessages, setErrorMessages] = useState({
    name: '',
    lead: false,
  })

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2,
    })
    // //console.log(result)
    if (!result.canceled) {
      //console.log(result.assets[0].uri,'new image picked...')
      setImage({ uri: result.assets[0].uri })
    }
  }

  const checkIfSelected = (user) => {
    const found = selectedMembers.find((singleuser) => singleuser.id == user.id)
    //console.log(found)
    return found
  }

  const toggleSelectedMembers = (user) => {
    if (checkIfSelected(user)) {
      setSelectedMembers((prev) => {
        const copy = [...prev]
        return copy.filter((singleuser) => user.id != singleuser.id)
      })
    }
  }

  const toggleTeamLead = (user) => {
    setTeamLead(null)
  }

  const selectTeamLead = () => {
    setShowTeamLeadPicker(true)
  }

  const selectTeamUsers = () => {
    setShowMembersPicker(true)
  }

  const updateImageQuery = () => {
    setOnUpdateImage(Math.random())
  }

  const addOrUpdateTeam = () => {
    if (
      hasTeamNameErrors(teamName, setErrorMessages) ||
      hasLeadPickerError(teamLead, setErrorMessages)
    ) {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
      return
    }
    setLoading(true)

    let body = {
      name: teamName,
      description: teamDescription,
    }

    if (image.uri) {
      if (!image.uri.includes('http')) {
        // if(id) body['logo_image'] = null
        let formattedImage = getImageFromPickedImage(image)
        // //console.log(formattedImage,'...formatted image....')
        if (formattedImage) {
          body['logo_image'] = formattedImage
        }
      }
    }

    // let attachments = getAttachmentsFromDocuments(documents)
    let members = getMembersObjFromSelectedUsers(selectedMembers)

    body = { ...body, ...members }

    //  //console.log(body, 'body...')
    // return
    if (id) {
      body['_method'] = 'put'
      if (teamLead) {
        body['lead_id'] = teamLead.id || teamLead.user_id
      }
      //console.log(body,'####body...')
      api.team
        .updateTeam(id, body)
        .then((res) => {
          if (res.success) {
            // //console.log(res, 'res....')
            navigation.navigate('Teams', { refetch: Math.random() })
            setLoading(false)
          }
        })
        .catch((err) => {
          setLoading(false)
          let errMsg = ''
          //console.log(err.response)
          try {
            errMsg = getErrorMessage(err?.response?.data)
          } catch (err) {
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
    } else {
      if (teamLead) {
        body['lead_id'] = teamLead.id
      }

      //console.log(body,'####body...')
      api.team
        .createTeam(body)
        .then((res) => {
          if (res.success) {
            // //console.log(res, 'create ....')
            navigation.navigate('Teams', { refetch: Math.random() })
            setLoading(false)
          }
        })
        .catch((err) => {
          setLoading(false)
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
    }
    //console.log(body)
  }

  useEffect(() => {
    const getTeamDetails = async () => {
      api.team
        .getTeam(id)
        .then((res) => {
          if (res.success) {
            const { name, description, user_members, user_lead, logo } = res.data

            setTeamName(name)
            if (description) {
              setTeamDescription(description?.plain_text_value)
            }
            if (user_members) {
              setSelectedMembers(user_members)
            }
            if (user_lead) {
              user_lead['id'] = user_lead?.user_id
              setTeamLead(user_lead)
            }
            if (logo) setImage({ uri: logo + '?' + onUpdateImage })
          }
        })
        .catch((err) => {
          //console.log(err.response)
        })
        .finally(() => {})
    }
    id && getTeamDetails()
  }, [])

  useEffect(() => {
    //console.log(selectedMembers,'selected team...')
  }, [selectedMembers])

  const { height, width } = Dimensions.get('window')

  return (
    <SafeAreaView
      style={[
        { flex: 1, backgroundColor: colors.WHITE, width: '100%' },
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={keyboardShow}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setKeyboardShow(false)
            Keyboard.dismiss()
          }}
        >
          <View
            style={[
              s.outerPadding,
              keyboardShow
                ? { marginBottom: 16 }
                : { marginBottom: Platform.OS === 'ios' ? (height > 670 ? 64 : 48) : 64 },
            ]}
          >
            <TeamUserPickerModal
              visibility={showTeamLeadPicker}
              setVisibility={setShowTeamLeadPicker}
              selected={teamLead}
              setSelected={setTeamLead}
              selectedMembers={selectedMembers}
              setSelectedMembers={setSelectedMembers}
              isMultiplePicker={false}
              label={'teamAdd'}
            />
            <TeamUserPickerModal
              visibility={showMembersPicker}
              setVisibility={setShowMembersPicker}
              selected={selectedMembers}
              setSelected={setSelectedMembers}
              isMultiplePicker={true}
              teamLead={teamLead}
              label={'teamAdd'}
            />
            <View style={s.headerContainer}>
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack()
                }}
              >
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
              <CText style={[g.title3, s.textColor]}>{id ? 'Update Team' : 'Add New Team'}</CText>
              <View style={s.buttonTeam}></View>
            </View>

            <ScrollView
              style={{ flex: 1, marginBottom: 16 }}
              ref={scrollViewRef}
              keyboardShouldPersistTaps="always"
              automaticallyAdjustKeyboardInsets={true}
            >
              <View style={{ flex: 1 }} onStartShouldSetResponder={()=>!keyboardShow}>
                <View style={s.container}>
                  <View style={s.imageContainer}>
                    {image && <Image source={image} style={{ width: 72, height: 72 }} />}
                  </View>

                  <View style={s.editButtonContainer}>
                    <IconWrap
                      onPress={pickImage}
                      outputRange={iconWrapColors}
                      // style={{backgroundColor:colors.PRIM_BG}}
                      style={{
                        backgroundColor: colors.PRIM_BG,
                        width: 32,
                        height: 32,
                      }}
                    >
                      <EditIcon fill={colors.ICON_BG} width={14} height={14} />
                    </IconWrap>
                  </View>
                </View>
                <CInputWithLabel
                  label="Name"
                  placeholder="Name"
                  value={teamName}
                  setValue={setTeamName}
                  showErrorMessage={false}
                  style={s.inputContainerStyle}
                  containerStyle={{ marginVertical: 8 }}
                  required
                  showErrorMessage={errorMessages.name !== ''}
                  errorMessage={errorMessages.name}
                  onFocus={() => setKeyboardShow(true)}
                  onBlur={()=>setKeyboardShow(false)}
                />

                <CSelectWithLabel
                  style={s.selectStyle}
                  containerStyle={{ marginVertical: 8 }}
                  label="Team Lead"
                  onPress={selectTeamLead}
                  selectText={'Select'}
                  required
                  showErrorMessage={errorMessages.lead}
                  errorMessage={errorMessages.lead}
                />
                {teamLead && (
                  <UserCard item={teamLead} toggleSelected={toggleTeamLead} isLead={true} />
                )}

                <CSelectWithLabel
                  style={s.selectStyle}
                  containerStyle={{ marginVertical: 8 }}
                  label="Team Users"
                  onPress={selectTeamUsers}
                  selectText={'Select'}
                  // required
                />

                {selectedMembers?.map((item) => {
                  return (
                    <UserCard
                      key={item?.id}
                      item={item}
                      navigation={navigation}
                      checkIfSelected={checkIfSelected}
                      toggleSelected={toggleSelectedMembers}
                    />
                  )
                })}

                <TextInput
                  style={s.inputStyle}
                  spaces={false}
                  maxLength={2000}
                  placeholder="Team Description"
                  multiline={true}
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholderTextColor={colors.HEADER_TEXT}
                  value={teamDescription}
                  onChangeText={setTeamDescription}
                  height={164}
                  onFocus={() => setKeyboardShow(true)}
                  onBlur={()=>setKeyboardShow(false)}
                />
              </View>
            </ScrollView>

            <CButtonInput
              label={id ? 'Update' : 'Save'}
              // style={{ paddingTop: 16 }}
              loading={loading}
              onPress={addOrUpdateTeam}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  selectStyle: { backgroundColor: colors.PRIM_BG, paddingVertical: 8 },
  outerPadding: {
    flex: 1,
    paddingHorizontal: 16,
    width: '100%',
    // marginBottom: 64,
  },
  textColor: {
    color: colors.HEADING,
  },

  inputContainerStyle: {
    backgroundColor: colors.PRIM_BG,
    padding: 8,
    // backgroundColor:"yellow"
  },

  cardContainer: {
    width: '100%',
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#c2d4ff',
    shadowOffset: { width: 4, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 13,
  },
  profileImage: { width: 44, height: 44, marginRight: 16, borderRadius: 22 },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
  inputStyle: {
    backgroundColor: colors.PRIM_BG,
    color: colors.BLACK,
    padding: 16,
    borderRadius: 10,
    // marginVertical: 8,
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 8,
  },
})
