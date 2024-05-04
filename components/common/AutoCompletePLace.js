import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import colors from '../../assets/constants/colors'

const AutoCompletePLace = ({
  type,
  placeholder,
  setValue,
  value,
  setLocality,
  setState,
  setCountry,
  setPostalCode,
  bgWhite,
  onFocus= () => {},
}) => {
  const placesRef = useRef()
  const [address, setAddress] = useState('')

  useEffect(() => {
    //console.log('Value', value)
    if (value) {
      placesRef.current?.setAddressText(value)
    }
  }, [value])

  useEffect(() => {
    setValue(address)
  }, [address])

  // const foucse = placesRef.current?.isFocused()
  // useEffect(()=>{
  //   console.log(foucse);
  // },[foucse])

  const getAddress = () => {
    // //console.log(placesRef.current);
    setValue(placesRef.current?.getAddressText)
  }

  const findLocality = (address) => {
    // //console.log(address);
    let locality = address.find((item) => item.types.indexOf('locality') >= 0)
    let adlevel1 = address.find((item) => item.types.indexOf('administrative_area_level_1') >= 0)
    if (!locality) {
      locality = adlevel1
    }
    // //console.log(locality);
    // //console.log(adlevel1);
    if (setLocality) {
      setLocality(locality.long_name)
    }
    if (setState) {
      setState(adlevel1.long_name)
    }
  }

  const findCountry = (address) => {
    // //console.log(address);
    let country = address.find((item) => item.types.indexOf('country') >= 0)
    // //console.log(country);
    if (setCountry) {
      setCountry(country.long_name)
    }
  }

  const getPostalCode = (address) => {
    // //console.log(address);
    let postalCode = address.find((item) => item.types.indexOf('postal_code') >= 0)

    if (setPostalCode) {
      // //console.log(postalCode);
      setPostalCode(postalCode?.long_name ? postalCode.long_name : '')
    }
  }

  return (
    // <ScrollView style={styles.container} keyboardShouldPersistTaps='always'>

    <GooglePlacesAutocomplete
      ref={placesRef}
      fetchDetails={true}
      listViewDisplayed="auto"
      renderDescription={(row) => row.description}
      placeholder={placeholder}
      editable={false}
      focus={() => console.log('focus.......')}
      onPress={(data, details = null) => {
        findLocality(details.address_components)
        findCountry(details.address_components)
        getPostalCode(details.address_components)
        getAddress()
        onFocus(true)
      }}
      
      query={{
        key: 'AIzaSyC2o6eOugVGbXlHmb9GaBmPM2zrfIjqzn4',
        language: 'en',
        // types: '(cities)',
        types: type !== '' ? `(${type})` : '',
        // types: '(regions)'  // For country
      }}
      onFail={(error) => {
        //console.log({ error })
      }}
      onNotFound={() => {
        //console.log('no results')
      }}
      listEmptyComponent={() => (
        <View style={{ flex: 1 }}>
          <Text>No results were found</Text>
        </View>
      )}
      textInputHide={false}
      textInputProps={{
        onChangeText: (text) => {
          // //console.log({ value, text });
          // if (text == '' && value != '') {
          //   setValue(value);
          // } else {
          setAddress(text)

          // setValue(text)
          // }
        },
        onFocus: () => {
          onFocus && onFocus(true)
        },

        onBlur: () => {
          onFocus && onFocus(false)
        },
      }}
      styles={{
        textInputContainer: {
          backgroundColor: colors.START_BG,
          borderRadius: 10,
          // paddingVertical: 5,
        },
        textInput: {
          backgroundColor: bgWhite ? colors.WHITE : colors.START_BG,
          borderRadius: 10,
          fontWeight: '500',
          height: 40,
        },
        description: {
          fontWeight: '400',
          zIndex: 1000,
        },
        predefinedPlacesDescription: {
          color: '#1faadb',
        },
        listView: {
          backgroundColor: colors.START_BG,
        },
        row: {},
        poweredContainer: {
          backgroundColor: colors.START_BG,
          display: 'none',
        },
      }}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 10,
    marginTop: 40,
  },
})

export default AutoCompletePLace
