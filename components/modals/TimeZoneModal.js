import React, { useState } from 'react'
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import { useEffect } from 'react'
import api from '../../api/api'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSearchInput from '../../components/common/CSearchInput'
import { getErrorMessage } from '../../utils/Errors'

export default function TimeZoneModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selectedIndex,
  setSelectedIndex,
}) {
  const [filteredTimeZones, setFilteredTimeZones] = useState([])
  const [searchedTimeZones, setSearchedTimeZones] = useState([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  const checkIfSelected = (zone) => {
    return selectedIndex?.item?.value == zone?.item?.value
  }

  const toggleSelected = (zone) => {
    if (zone?.item?.value == selectedIndex?.item?.value) setSelectedIndex({ index: -1, item: '' })
    else {
      setSelectedIndex(zone)
      closeModal()
    }
  }

  const closeModal = () => {
    setVisibility(false)
  }

  // This is the function that is called when the search input changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  // This is the function that is called when the query changes
  useEffect(() => {
    const body = {
      allData: true,
    }
    if (query != '') {
      body['search'] = query
    }
    //console.log(body, 'bodyyy')
    api.timezone
      .getTimezones(body)
      .then((res) => {
        //console.log(res, 'res')
        setFilteredTimeZones(res)
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
  }, [query])

  // This is the function that is called when the query changes
  useEffect(() => {
    if (query != '') {
      const searchedTimeZone = filteredTimeZones.filter((zone) => {
        return zone.value.toLowerCase().match(query.toLowerCase())
      })
      setSearchedTimeZones(searchedTimeZone)
    } else {
      setSearchedTimeZones(filteredTimeZones)
    }
  }, [query])

  // This is the function that is called for each item in the FlatList
  const TimeZoneSelectCard = (item) => {
    return (
      <TouchableOpacity
        key={item.index}
        style={[g.containerBetween, s.modalInnerContainer]}
        onPress={() => toggleSelected(item)}
      >
        <Text>
          {item.item.label.length > 30 ? item.item.label.slice(0, 30) + '...' : item.item.label}
        </Text>
        {checkIfSelected(item) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
      </TouchableOpacity>
    )
  }

  return (
    <Modal
      visible={visibility}
      animationType="fade"
      onRequestClose={closeModal}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={[{ flex: 1, backgroundColor: colors.CONTAINER_BG }]}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Select Time Zone"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
            containerStyle={{ marginTop: 0 }}
          />
          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />

          {/* <ScrollView style={s.modalOuterContainer}>
          {filteredTimeZones.map((zone, idx) => {
            
          })}
        </ScrollView> */}
          <FlatList
            data={query === '' ? filteredTimeZones : searchedTimeZones}
            renderItem={TimeZoneSelectCard}
            keyExtractor={(item, index) => index}
          />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.MID_BG,
  },
  modalInnerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
})
