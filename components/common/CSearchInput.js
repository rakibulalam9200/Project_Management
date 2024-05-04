import React from 'react'
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import CrossIcon from '../../assets/svg/cross-blue.svg'
import FilterIcon from '../../assets/svg/filter.svg'
import SearchIcon from '../../assets/svg/search.svg'

export default function CSearchInput({
  value,
  setValue,
  placeholder = '',
  placeholderTextColor = colors.HEADER_TEXT,
  style,
  onPress = null,
  filterIcon = false,
  searchIcon = false,
  isGSearch = false,
}) {
  return (
    <View style={[s.searchSection, style]}>
      <TextInput
        style={s.input}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        onChangeText={setValue}
        value={value}
        underlineColorAndroid="transparent"
      />
      {filterIcon && (
        <TouchableOpacity onPress={onPress}>
          <FilterIcon fill={colors.SECONDARY} />
        </TouchableOpacity>
      )}
      {searchIcon && (
        <>
          {isGSearch && value?.length > 0 ? (
            <TouchableOpacity onPress={() => setValue("")}>
              <CrossIcon fill={colors.SECONDARY} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onPress}>
              <SearchIcon fill={colors.SECONDARY} />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  searchSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 16,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  searchIcon: {
    padding: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    color: '#424242',
  },
})
