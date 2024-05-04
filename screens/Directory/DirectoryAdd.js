import React, { useState, useEffect, useRef } from 'react'
import { Text, View, ScrollView, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import { useDispatch, useSelector } from 'react-redux'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import api from '../../api/api'
import { extractPermissionsIdsFromRef, formatPermissions } from '../../utils/Permissions'
import CButtonInput from '../../components/common/CButtonInput'
import { useIsFocused } from '@react-navigation/native'
import { setNormal } from '../../store/slices/tab'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import UserPickerModal from '../../components/modals/UserPickerModal'
import * as ImagePicker from 'expo-image-picker'
import { getImageFromPickedImage } from '../../utils/Attachmets'
import IconWrap from '../../components/common/IconWrap'
import EditIcon from '../../assets/svg/edit.svg'
import { getMembersObjFromSelectedUsers } from '../../utils/User'

export default function DirectoryAddScreen({ navigation, route }) {
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [name, setName] = useState('')
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState({ uri: null })
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

  const [errorMessages, setErrorMessages] = useState({
    name: '',
    users: '',
  })

  const goBack = () => {
    navigation.goBack()
  }

  const openUserPickerModal = () => {
    setShowUserPickerModal(true)
  }


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })
    // //console.log(result)
    if (!result.canceled) {
      //console.log(result.assets[0].uri)
      setImage({ uri: result.assets[0].uri })
    }
  }

  const saveGroup = () => {
    if (!name) {
      setErrorMessages({ name: 'Name is required' })
      return
    }
    if (selectedUsers.length < 1) {
      setErrorMessages({ users: 'Users are required' })
      return
    }

    //console.log('saveGroup')
    let body = {
      name,
    }
    if (image.uri) {
      // if the uri is a local uri , add it to the body

      if (!image.uri.includes('http')) {
        let formattedImage = getImageFromPickedImage(image)
        if (formattedImage) body['logo_image'] = formattedImage
      }
    }

    let members = getMembersObjFromSelectedUsers(selectedUsers)

    body = { ...body, ...members }

    //console.log('body', body)
    setLoading(true)
    api.group.createGroup(body).then((res) => {
      //console.log('res', res)
      if (res.success) {
        Alert.alert('Group created successfully.')
        navigation.goBack()
      }
    })
      .catch((err) => {
        //console.log('err', err.response.data)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  return (
    <SafeAreaView style={s.outerContainer}>
      <UserPickerModal
        visibility={showUserPickerModal}
        setVisibility={setShowUserPickerModal}
        selected={selectedUsers}
        setSelected={setSelectedUsers}
      />

      <View style={{ flex: 1 }}>
        <View style={s.container}>
          <CHeaderWithBack title={'Add new Group'} onPress={goBack} />

          <CInputWithLabel
            label="Name"
            placeholder="Name"
            value={name}
            setValue={setName}
            showErrorMessage
            errorMessage={errorMessages.name}
          />

          <CSelectWithLabel
            label="Team Users"
            onPress={openUserPickerModal}
            selectText={'Select'}
            showErrorMessage
            errorMessage={errorMessages.users}
          />

          <View style={{ marginBottom: 0, flexDirection: 'row' }}>

            <TouchableOpacity style={{}} onPress={pickImage}>
              <View style={s.imageContainer}>
                {image && <Image source={image} style={{ width: 72, height: 72 }} />}
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
            <Text style={{ marginLeft: 10, top: 25, fontWeight: '700' }}>Group Logo</Text>
          </View>

          <CButtonInput label={'Save'} onPress={saveGroup} loading={loading} />
        </View>
      </View>
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
    paddingHorizontal: 20,
    paddingBottom: 60,
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
    left: 50,
    width: 32,
    height: 32,
  },
  textStyle: {
    fontFamily: 'inter-regular',
    fiontWeight: 'bold',
    fontSize: 16,
    color: colors.NORMAL,
    marginLeft: 4,
  },
  groupImage: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: colors.START_BG,
    flexDirection: 'row',
    alignItems: 'center',


  }
})
