import React, { useEffect, useState } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import CText from '../common/CText'

const layouts = [
    {id:1,name:'horizental'},
    {id:2,name:'vertical'},
]
export default function AttachmentModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
}) {
    const [allPriority, setAllPrority] = useState([])
    const [search, setSearch] = useState('')
    const checkIfSelected = (priority) => {
      return selected.id == priority.id
    }
  
    const toggleSelected = (priority) => {
      if (priority.id == selected.id) setSelected({ id: -1 })
      else {
        setSelected(priority)
        closeModal()
      }
    }
  
    const closeModal = () => {
      setVisibility(false)
    }
    const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  
    useEffect(() => {
      setAllPrority(layouts)
    }, [allPriority])

  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <TouchableOpacity style={[s.modalOuterContainer]} onPress={closeModal}>
        <View style={s.modalContainer}>
          <CText style={[g.title3, s.textColor]}>Choose Layout</CText>
          {allPriority?.map((priority, idx) => {
            return (
              <TouchableOpacity
                key={idx}
                style={[g.containerBetween, s.modalInnerContainer]}
                onPress={() => toggleSelected(priority)}
              >
                <Text>
                  {priority.name.length > 30
                    ? priority.name.slice(0, 30) + '...'
                    : capitalizeFirstLetter(priority.name)}
                </Text>
                {checkIfSelected(priority) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
              </TouchableOpacity>
            )
          })}
        </View>
      </TouchableOpacity>
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
    width: '80%',
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
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingsItemText: {
    fontFamily: 'inter-regular',
    color: colors.HOME_TEXT,
    fontSize: 18,
  },
  textColor: {
    color: '#000E29',
    textAlign: 'center',
  },
  itemContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInnerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
})
