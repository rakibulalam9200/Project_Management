import { StyleSheet, View, Modal, TouchableOpacity, Pressable, ScrollView } from 'react-native'
import { useState, useEffect } from 'react'
import CButton from '../common/CButton'
import CText from '../common/CText'
import IconWrap from '../common/IconWrap'

import BackIcon from '../../assets/svg/arrow-left.svg'
import PlusIcon from '../../assets/svg/plus-filled.svg'
import CloseIcon from '../../assets/svg/close.svg'

import filters from '../../assets/constants/filters'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

const FiltersModal = ({ visibility, setVisibility, title, filterList = [], setFilters }) => {
  const [activeFilters, setActiveFilters] = useState(filterList)
  const [inactiveFilters, setInactiveFilters] = useState([])

  useEffect(() => {
    setActiveFilters(filterList)
  }, [filterList])

  useEffect(() => {
    if (!visibility) {
      for (let item of inactiveFilters) {
        if (filterList.includes(item)) { setInactiveFilters(pS => pS.filter(filter => filter !== item)) }
      }
    } else {
      let localActive = []
      for (let filter in filters) {
        if (!filterList.includes(filter)) { localActive.push(filter) }
      }
      setInactiveFilters(localActive)
    }
  }, [visibility])

  const handleClose = () => {
    setVisibility(false)
    setActiveFilters(filterList)
  }
  const handleSave = () => {
    setFilters(activeFilters)
    setVisibility(false)
  }

  if (!inactiveFilters) { return null }
  return (
    <Modal
      onRequestClose={handleClose}
      animationType="fade"
      statusBarTranslucent={true}
      transparent={true}
      visible={visibility}>
      <TouchableOpacity style={[g.container, s.modalBG]} activeOpacity={1} onPress={handleClose}>
        <Pressable style={s.modalWrap}>
          <View style={{ width: '100%' }}>
            <View style={s.header}>
              <IconWrap
                outputRange={[colors.WHITE, colors.MID_BG, colors.END_BG]}
                borderRadius={11}
                onPress={handleClose}>
                <BackIcon fill={colors.NORMAL} />
              </IconWrap>
              <CText style={[s.headerText]}>{title}</CText>
            </View>
            <View style={s.filterWrap}>
              {inactiveFilters.length ? (
                <FiltersBlock
                  onPress={item => {
                    setInactiveFilters(inactiveFilters.filter(filter => filter !== item))
                    setActiveFilters(pS => [...pS, item])
                  }}
                  localFilters={inactiveFilters}
                  style={{ marginTop: 16 }}
                  icon={<PlusIcon style={s.filterIcon} fill={colors.WHITE} />}
                />
              ) : null}
              {activeFilters.length && inactiveFilters.length ? <View style={s.separator} /> : null}
              {activeFilters.length ? (
                <FiltersBlock
                  onPress={item => {
                    setActiveFilters(activeFilters.filter(filter => filter !== item))
                    setInactiveFilters(pS => [...pS, item])
                  }}
                  localFilters={activeFilters}
                  icon={<CloseIcon style={s.filterIcon} fill={colors.WHITE} />}
                  style={{ marginTop: 8, marginBottom: 8 }}
                />
              ) : null}
            </View>
          </View>
          <CButton style={{ alignSelf: 'flex-end', justifySelf: 'flex-end' }} onPress={handleSave}>
            <CText style={g.button}>Save</CText>
          </CButton>
        </Pressable>
      </TouchableOpacity>
    </Modal>
  )
}

export const FiltersBlock = ({
  localFilters,
  icon,
  style,
  onPress,
  itemStyle,
  horizontal = false,
  refer,
}) => {
  return (
    <ScrollView
      bounces={horizontal}
      ref={refer}
      showsHorizontalScrollIndicator={false}
      horizontal={horizontal}
      style={horizontal && { maxHeight: 56 }}
      contentContainerStyle={[s.filtersContainer, horizontal && s.filtersBlockH, style]}>
      {localFilters.map((item, i) => {
        const color = filters[item].color
        const text = filters[item].text
        return (
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => onPress(item)}
            key={i}
            style={[
              s.filter,
              { backgroundColor: color, marginRight: localFilters.length - 1 === i ? 0 : 8 },
              horizontal && s.filterH,
              itemStyle,
            ]}>
            {icon}
            <CText style={{ textAlign: 'center' }}>{text}</CText>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

export default FiltersModal

const s = StyleSheet.create({
  modalBG: {
    flex: 1,
    backgroundColor: '#010714B8',
    paddingHorizontal: 23,
  },
  modalWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.PRIM_BG,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    minHeight: 400,
    maxHeight: 550,
  },
  filtersBlockH: {
    flexWrap: 'nowrap',
    paddingVertical: 0,
    paddingHorizontal: 23,
    marginBottom: 25,
    height: 44,
  },
  filterH: {
    marginBottom: 0,
    maxHeight: 44,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
  },
  headerText: {
    ...g.title2,
    color: colors.BLACK,
    marginLeft: 20,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: colors.SEC_BG,
  },
  filterWrap: {
    width: '100%',
  },
  filter: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 39,
    marginBottom: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterIcon: {
    marginRight: 6,
    shadowColor: '#adadad',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 4,
  },
})
