import React, { useEffect, useState } from 'react'
import { Alert, KeyboardAvoidingView, Modal, StyleSheet, Text, View } from 'react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CButton from '../common/CButton'
import CInputWithLabel from '../common/CInputWithLabel'
import CText from '../common/CText'

export default function SaveFilterListModal({
  children,
  visibility,
  setVisibility,
  searchData,
  moduleName,
  editData,
  resetFilters,
  setEditData,
  setListingSearch,
  setRefresh,
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [filterName, setFilterName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFilterName(editData?.name)
  }, [editData?.id])

  const saveOrUpdteFilter = () => {
    if (filterName === '' || filterName === undefined) {
      Alert.alert('Please, Enter Filter name ')
      return
    }

    if (
      searchData?.issue_ids?.length === 0 &&
      searchData?.milestone_ids?.length === 0 &&
      searchData?.project_ids?.length === 0 &&
      searchData?.stages?.length === 0 &&
      searchData?.search === ''
    ) {
      Alert.alert('Please, Select search item or Enter a search Text to save.')
      return
    }

    let body = {
      moduleName: moduleName,
      filterName: filterName,
      search_data: searchData,
    }
    setLoading(true)
    if (editData.id) {
      body['_method'] = 'PUT'
      api.filterHistory
        .updateFilterHistory(body, editData.id)
        .then((res) => {
          if (res.success) {
            // //console.log(res,"------------------------")
            // setStatus(status)
            closeModal()
            Alert.alert('Updated Filter successfully...')
            setFilterName('')
            setEditData({})
            resetFilters()
            setListingSearch('')
            setRefresh((prev) => !prev)
          }
        })
        .catch((err) => {
          //console.log(err.response.message, 'error...........')
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
    } else {
      //console.log(body, 'body..........')
      api.filterHistory
        .storeFilterHistory(body)
        .then((res) => {
          if (res.success) {
            //console.log(res, '------------------------')
            // setStatus(status)
            closeModal()
            Alert.alert('Saved Filter successfully...')
            setFilterName('')
            resetFilters()
            setListingSearch('')
            setRefresh((prev) => !prev)
          }
        })
        .catch((err) => {
          //console.log(err.response, 'error...........')
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
  }

  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[s.modalOuterContainer]}>
        <KeyboardAvoidingView
          behavior="position"
          enabled
          style={{ height: '40%', marginHorizontal: 16 }}
        >
          <View style={s.modalContainer}>
            <Text style={[{ textAlign: 'center', color: '#000E29', paddingVertical: 8 }, g.title3]}>
              {editData?.id ? 'Update filter' : 'Save filter'}
            </Text>
            <CInputWithLabel
              value={filterName}
              setValue={setFilterName}
              placeholder=""
              label="Filter name"
              style={{ backgroundColor: 'white', paddingVertical: 16, height: 64 }}

              // showErrorMessage
              // errorMessage={errorMessages.name}
            />
            <View style={[s.listItemContainer, { width: '100%', marginVertical: 8 }]}>
              <CButton
                type="gray"
                style={[s.margin1x, s.grayButton]}
                onPress={() => {
                  closeModal()
                }}
              >
                <CText style={g.title3}>Cancel</CText>
              </CButton>
              <CButton
                style={[s.margin1x, s.blueButton]}
                onPress={saveOrUpdteFilter}
                loading={loading}
              >
                <CText style={g.title3}>{editData?.id ? 'Update' : 'Save'}</CText>
              </CButton>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.5)',
  },
  modalContainer: {
    width: '100%',
    alignItems: 'stretch',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 20,
    padding: 16,
  },
  headerContainerStyle: {
    marginVertical: 16,
  },
  headerLabel: {
    fontSize: 18,
    fontWeight: 'normal',
    marginLeft: 8,
  },
  settingsItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.WHITE,
    paddingVertical: 8,
  },
  settingsItemText: {
    fontFamily: 'inter-regular',
    color: colors.HOME_TEXT,
    fontSize: 18,
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
  margin1x: {
    marginVertical: 10,
  },
  margin2x: {
    marginVertical: 10,
  },
  grayButton: {
    backgroundColor: colors.HEADER_TEXT,
    width: '48%',
  },
  blueButton: {
    backgroundColor: colors.SECONDARY,
    width: '48%',
    marginLeft: 10,
  },
})
