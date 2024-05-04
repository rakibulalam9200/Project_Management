import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import { useIsFocused } from '@react-navigation/native'
import { FlatList } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'
import ToggleSwitch from 'toggle-switch-react-native'
import api from '../../api/api'
import ResetIcon from '../../assets/svg/reset.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import IconWrap from '../../components/common/IconWrap'
import ParentRolePickerModal from '../../components/modals/ParentRolePickerModal'
import { setNormal } from '../../store/slices/tab'
import { getErrorMessage, hasRoleNameErrors } from '../../utils/Errors'
import { extractPermissionsIdsFromRef, formatPermissions } from '../../utils/Permissions'

const PermissionsCard = ({ props, toggleEnabledGlobal, enabledPermissions }) => {
  const { item } = props
  // //console.log(item, 'Items')
  const [enabled, setEnabled] = useState(() => {
    let initialEnabled = {}
    item?.children?.map((permissionSwitch) => {
      if (enabledPermissions.current[permissionSwitch.id]) {
        initialEnabled[permissionSwitch.id] = true
      }
    })
    return initialEnabled
  })
  const checkIfEnabled = (item) => {
    return enabled[item.id]
  }

  const toggleEnabled = (item) => {
    setEnabled((prev) => {
      const copy = { ...prev }
      if (checkIfEnabled(item)) {
        copy[item.id] = undefined
      } else {
        copy[item.id] = true
      }
      return copy
    })
    toggleEnabledGlobal(item)
  }

  return (
    <View key={item.id} style={s.permissionCategoryContainer}>
      <Text style={s.permissionLabel}>{formatPermissions(item.name)}</Text>
      <View style={s.permissionItemContainer}>
        {item?.children?.map((permissionSwitch) => {
          return (
            <View
              key={permissionSwitch.id}
              style={[
                s.permissionItem,
                g.containerBetween,
                permissionSwitch?.name?.length > 15 ? { width: '100%' } : { width: '50%' },
              ]}
            >
              <Text>{permissionSwitch.name}</Text>
              <ToggleSwitch
                isOn={checkIfEnabled(permissionSwitch)}
                onColor="green"
                offColor={colors.SEC_BG}
                labelStyle={{ color: 'black', fontWeight: '900' }}
                size="medium"
                onToggle={(isOn) => toggleEnabled(permissionSwitch)}
                animationSpeed={150}
              />
            </View>
          )
        })}
      </View>
    </View>
  )
}

export default function RoleAddOrEditScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  let id = route.params ? route.params.id : null
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [roleName, setRoleName] = useState('')
  const [allPermissions, setAllPermissions] = useState([])
  const [openParentRoleModal, setOpenParentRoleModal] = useState(false)
  const [selectedParentRole, setSelectedParentRole] = useState({})
  const [restorePermissions, setRestorePermissions] = useState(false)
  const [loading, setLoading] = useState(false)
  const enabledPermissions = useRef({})
  const [errorMessages, setErrorMessages] = useState({
    name: '',
  })

  const toggleEnabledGlobal = (item) => {
    enabledPermissions.current[item.id] = enabledPermissions.current[item.id] ? undefined : true
  }

  const goBack = () => {
    navigation.goBack()
  }

  const handleRestoreDefaults = () => {
    //here i need to reset the enabledPermissions to false and reset the selectedParentRole and reset the name in input field
    setRoleName('')
    setSelectedParentRole({})
    //read the code and toggle each switch to false
    allPermissions.forEach((permission) => {
      permission.children.forEach((child) => {
        enabledPermissions.current[child.id] = false
      })
    })
    setRestorePermissions(!restorePermissions)
  }

  const saveRole = () => {
    if (hasRoleNameErrors(roleName, setErrorMessages)) return
    const body = {
      name: roleName,
      permissions: extractPermissionsIdsFromRef(enabledPermissions),
    }

    if (id) {
      body['_method'] = 'PUT'
      api.role
        .updateRole(id, body)
        .then((res) => {
          if (res.success) {
            navigation.navigate('Roles', { refetch: Math.random() })
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
    } else {
      if (selectedParentRole?.id) {
        body['parent_id'] = selectedParentRole.id
      } else {
        Alert.alert('Please select a parent role')
        return
      }
      api.role
        .createRole(body)
        .then((res) => {
          if (res.success) {
            navigation.navigate('Roles', { refetch: Math.random() })
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
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([id ? api.role.getRole(id) : Promise.resolve(null), api.role.getAllPermissions()])
      .then((values) => {
        if (values[0]) {
          const res = values[0]
          if (res.success) {
            const { permissions, name } = res.role
            permissions.forEach((permissionID) => {
              enabledPermissions.current[permissionID] = true
            })
            setRoleName(name)
          }
        }
        // //console.log(values[1],'permissions fetched')
        setAllPermissions(values[1])
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
  }, [restorePermissions])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  return (
    <SafeAreaView style={s.outerContainer}>
      <ParentRolePickerModal
        visibility={openParentRoleModal}
        setVisibility={setOpenParentRoleModal}
        selected={selectedParentRole}
        setSelected={setSelectedParentRole}
      />
      <View style={{ flex: 1 }}>
        <View style={s.container}>
          <CHeaderWithBack
            title={id ? 'Edit Role' : 'Add new role'}
            onPress={goBack}
            containerStyle={{ marginTop: 0 }}
          />

          <CInputWithLabel
            label="Name"
            placeholder="Name"
            value={roleName}
            setValue={setRoleName}
            showErrorMessage={errorMessages.name !== ''}
            errorMessage={errorMessages.name}
            editable={id ? false : true}
            style={id ? s.disabledNameField : {}}
          />

          {!id && (
            <CSelectWithLabel
              label="Parent role"
              onPress={() => setOpenParentRoleModal(true)}
              selectText={selectedParentRole?.id ? selectedParentRole.name : 'Select'}
            />
          )}

          <View style={s.permissionContainer}>
            {loading && (
              <View style={{ justifyContent: 'center', flex: 1, width: '100%' }}>
                <ActivityIndicator size="large" color={colors.HOVER} />
              </View>
            )}
            {!loading && (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={allPermissions}
                keyExtractor={(item) => item.id}
                renderItem={(props) => (
                  <PermissionsCard
                    props={props}
                    toggleEnabledGlobal={toggleEnabledGlobal}
                    enabledPermissions={enabledPermissions}
                  />
                )}
                containerStyle={{
                  flex: 1,
                  flexDirection: 'row',
                  marginBottom: 120,
                  paddingHorizontal: 16,
                }}
              />
            )}
          </View>
          <View style={!id && s.bottomSection}>
            {!id && (
              <TouchableOpacity
                onPress={handleRestoreDefaults}
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
              >
                <IconWrap onPress={handleRestoreDefaults} outputRange={iconWrapColors}>
                  <ResetIcon />
                </IconWrap>
                <Text style={{ color: colors.GREY }}>Restore defaults</Text>
              </TouchableOpacity>
            )}
            <CButtonInput
              label={id ? 'Update' : 'Save'}
              onPress={saveRole}
              style={[{ marginBottom: 8 }, !id ? { width: '50%' } : {}]}
            />
          </View>
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
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  permissionLabel: {
    color: colors.NORMAL,
    fontFamily: 'inter-regular',
    fontWeight: '700',
    fontSize: 16,
  },

  disabledNameField: { backgroundColor: 'rgba(156, 162, 171, 0.2)', color: colors.LIGHT_GRAY },
  bottomSection: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionItemContainer: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  permissionItem: {
    // width: '50%',
    marginVertical: 8,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
  permissionCategoryContainer: {
    marginVertical: 8,
  },
})
