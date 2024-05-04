import React, { useState } from 'react'
import { FlatList, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import { useEffect } from 'react'
import api from '../../api/api'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSearchInput from '../../components/common/CSearchInput'

export default function CountryPickerModal({
    visibility,
    setVisibility,
    selected,
    setSelected,
}) {

    const [countries, setCountries] = useState([])
    const [search, setSearch] = useState('')
    const [searchedCountries, setSearchedCountries] = useState([])
    const [query, setQuery] = useState('')
    const checkIfSelected = (country) => {
        return selected.index == country.index
    }

    const toggleSelected = (country) => {
        if (country.index == selected.index) setSelected({ index: -1, item: '' })
        else {
            setSelected(country)
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
        }, 500)

        return () => clearTimeout(delayDebounceFn)
      }, [search])

    // This is the function that is called when the query changes
      useEffect(() => {
    
        if (query != '') {
            const filteredCountries = countries.filter((country) => {
                return country.name.toLowerCase().startsWith(query.toLowerCase())
            })
            setSearchedCountries(filteredCountries)
        }else{
            setSearchedCountries(countries)
        }
      }, [query])



    useEffect(() => {
        api.country.getCountries()
            .then((res) => {
                setCountries(res.data)
            })
            .catch((err) => {
                //console.log(err)
            })
    }, [])

    // This is the function that is called for each item in the FlatList
    const CountrySelectCard = (item) => {

        // //console.log(item)
        return (

            <TouchableOpacity

                style={[g.containerBetween, s.modalInnerContainer]}
                onPress={() => toggleSelected(item)}
            >
                <Text>{item.item.name > 30 ? item.item.name.slice(0, 30) + '...' : item.item.name}</Text>
                {checkIfSelected(item) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
            </TouchableOpacity>

        )
    }

    return (
        <Modal visible={visibility} animationType="fade" onRequestClose={closeModal} style={{ flex: 1,backgroundColor: colors.CONTAINER_BG }}>
            <SafeAreaView style={{flex:1}}>
            <View style={g.outerContainer}>
                <CHeaderWithBack
                    onPress={closeModal}
                    title="Select Country"
                    labelStyle={[g.body1]}
                    iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
                />
                <CSearchInput placeholder="Search" value={search} setValue={setSearch} />

                <FlatList
                    data={query == '' ? countries : searchedCountries}
                    renderItem={CountrySelectCard}
                    keyExtractor={(item) => item.numericCode}
                    style={s.modalOuterContainer}
                />
            </View>
            </SafeAreaView>
        </Modal>
    )
}

const s = StyleSheet.create({
    modalOuterContainer: {
        flex: 1,
        padding: 16,
    },
    modalInnerContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.SEC_BG,
    },
})
