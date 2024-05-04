import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { FlatList, createNativeWrapper } from 'react-native-gesture-handler'
import colors from '../../assets/constants/colors'
import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SortIcon from '../../assets/svg/sort.svg'
import api from '../../api/api'
import g from '../../assets/styles/global'
import CSearchInput from '../../components/common/CSearchInput'
import MoreIcon from '../../assets/svg/more.svg'
import getIconbyKey from '../../assets/constants/getIconbyKey'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import { useIsFocused } from '@react-navigation/native'

export default function DirectoryScreen({ navigation, route }) {
  const [search, setSearch] = useState('')
  const [directoryData, setDirectoryData] = useState([])
  const [loading, setLoading] = useState(false)
  const isFocused = useIsFocused()

  useEffect(() => {
    api.group
      .getGroups()
      .then((res) => {
        //console.log(res.data)
        setDirectoryData(res.data)
      })
      .catch((err) => {
        //console.log(err)
      })
  }, [isFocused])

  const DirectoryCard = ({ item }) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => {
          navigation.navigate('DirectoryDetail', { item })
        }}
        style={{ alignItems: 'center', justifyContent: 'center', width: '33%', marginBottom: 10 }}
        // style={s.mainItemContainer}
      >
        <View style={s.iconWrapperBig}>
          {item.logo.includes('noimage.png') ? (
            <>{getIconbyKey[item.name]}</>
          ) : (
            <Image source={{ uri: item.logo }} style={{ height: 60, width: 60 }} />
          )}
        </View>
        <Text style={s.mainItemText}>{item.name}dsjkfgh</Text>
      </TouchableOpacity>
    )
  }
  return (
    <>
      <View style={[s.outerContainer]}>
        <View style={s.outerPadding}>
          <View style={s.headerContainer}>
            <IconWrap
              onPress={() => {
                navigation.goBack()
              }}
            >
              <BackArrow fill={colors.NORMAL} />
            </IconWrap>
            <CText style={[s.textColor]}>Directory</CText>
            <View style={s.buttonGroup}>
              <IconWrap onPress={() => {}} style={s.buttonGroupBtn}>
                <SortIcon fill={colors.NORMAL} />
              </IconWrap>
              <IconWrap
                onPress={() => {
                  // setShowSettingsModal(true)
                }}
                style={s.buttonGroupBtn}
              >
                <MoreIcon fill={colors.NORMAL} />
              </IconWrap>
            </View>
          </View>

          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />
        </View>
        <View style={{ flex: 1, marginTop: 10, paddingBottom: 20 }}>
          <FlatList
            data={directoryData}
            renderItem={DirectoryCard}
            keyExtractor={(item, index) => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <CFloatingPlusIcon onPress={() => navigation.navigate('DirectoryAdd')} />
      </View>
    </>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingTop: 20,
    backgroundColor: 'yellow',
  },

  outerContainer: {
    paddingTop: StatusBar.currentHeight,

    backgroundColor: colors.PRIM_BG,
    flex: 1,
    alignItems: 'center',
  },
  outerPadding: {
    paddingHorizontal: 16,

    width: '100%',
  },

  textColor: {
    color: 'black',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'inter-semibold',
    textAlignVertical: 'center',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    // marginTop: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },

  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    color: '#424242',
  },
  iconWrapperBig: {
    backgroundColor: colors.WHITE,
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },
  mainItemText: {
    fontFamily: 'inter-regular',
    fontSize: 16,
    paddingTop: 10,
    color: colors.HOME_TEXT,
    fontWeight: '500',
  },
})
