//import liraries
import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform, StatusBar } from 'react-native'
import { TouchableOpacity } from 'react-native'
import colors from '../../assets/constants/colors'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import EditIcon from '../../assets/svg/edit.svg'

const settingsTypes = [
  {
    title: 'Security',
    desc: 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    navigation: 'CompanySecurityScreen',
  },
  {
    title: 'Projects',
    desc: 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    navigation: 'ProjectSettingsScreen',
  },
  {
    title: 'Timelogs',
    desc: 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    navigation: 'TimelogLimitsScreen',
  },
]

// create a component
const CompanySettingsScreen = ({ navigation, route }) => {
  return (
    <SafeAreaView
      style={[
        { backgroundColor: colors.PRIM_BG, flex: 1 },
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <View style={{ marginHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackArrow />
        </TouchableOpacity>
        <Text style={{ width: '80%', textAlign: 'center', fontSize: 16, fontWeight: '500' }}>
          Company Settings
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ flex: 1 }}>
        <View style={s.container}>
          {settingsTypes.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(item.navigation)}
              style={s.cards}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 18, fontWeight: '700' }}>{item.title}</Text>
                <EditIcon />
              </View>
              <Text style={{ marginTop: 16, fontWeight: '600' }}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// define your styles
const s = StyleSheet.create({
  container: {
    flex: 1,
    // height: '100%',
    paddingHorizontal: 16,
    // backgroundColor: colors.WHITE,
    // borderWidth: 1,
  },

  cards: {
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    shadowColor: colors.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
})

export default CompanySettingsScreen
