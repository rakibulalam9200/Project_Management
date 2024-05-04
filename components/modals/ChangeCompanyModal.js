import { StyleSheet, Text, View, Modal, TouchableOpacity, Alert, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import CHeaderWithBack from '../common/CHeaderWithBack'
import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'

import RadioFilledIcon from '../../assets/svg/radio-filled-gray.svg'
import RadioEmptyIcon from '../../assets/svg/radio-empty-gray.svg'
import CButtonInput from '../common/CButtonInput'
import api from '../../api/api'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { changeCompany, refreshCompanies } from '../../store/slices/user'
import { getErrorMessage } from '../../utils/Errors'
import { loadPermissions } from '../../store/slices/auth'

export default function ChangeCompanyModal({ children, visibility, setVisibility, navigation }) {
  const store = useStore()
  const { companies, domainIndex } = useSelector((state) => state.user)
  const [selectedIndex, setSelectedIndex] = useState(domainIndex)
  const dispatch = useDispatch()

  useEffect(() => {
    setSelectedIndex(domainIndex)
  }, [domainIndex])
  const closeModal = () => {
    setVisibility(false)
  }
  const checkIfSelected = (company) => {
    return selectedIndex == company.id
  }

  const toggleSelected = (company) => {
    if (company.id == selectedIndex) setSelectedIndex(-1)
    else setSelectedIndex(company.id)
  }
  useEffect(() => {
    dispatch(refreshCompanies()).catch((err) => { })
  }, [])
  const handleChangeCompany = () => {
    if (selectedIndex != -1) {
      dispatch(changeCompany(selectedIndex))
        .then((res) => {
          if (res.success) {
            dispatch(loadPermissions())
              .then((res) => {
                //console.log('Permissions loaded')
              })
              .catch((err) => {
                //console.log(err.resonse.data)
              })
            closeModal()
          }
        })
        .catch((err) => {
          let errorMsg = ''
          try {
            errorMsg = getErrorMessage(err)
          } catch (err) {
            errorMsg = 'An error occurred. Please try again later.'
          }
          Alert.alert(errorMsg)
        })
    } else {
      Alert.alert('Please select a company first.')
    }
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Company"
            labelStyle={s.headerLabel}
            iconWrapColors={iconWrapColors}
            containerStyle={s.headerContainerStyle}
          />
          <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
            {companies.map((company, idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  style={[g.containerBetween, s.modalInnerContainer]}
                  onPress={() => toggleSelected(company)}
                >
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{company.name}</Text>
                  {checkIfSelected(company) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
          <CButtonInput label="Switch" onPress={handleChangeCompany} />
        </View>
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
    width: '60%',
    alignItems: 'stretch',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 20,
    // padding: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContainerStyle: {
    marginVertical: 16,
  },
  headerLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalInnerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.WHITE,
  },
})
