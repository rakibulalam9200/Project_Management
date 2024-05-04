import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import { SupportStatus } from '../../assets/constants/filters'
import g from '../../assets/styles/global'
import CollapseIcon from '../../assets/svg/collapse-icon.svg'
import ExpandIcon from '../../assets/svg/expand.svg'
import FloatingPlusButton from '../../assets/svg/floating-plus.svg'
import MoreIcon from '../../assets/svg/more.svg'
import CMidHeaderWithIcons from '../../components/common/CMidHeaderWithIcons'
import CSearchInput from '../../components/common/CSearchInput'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import { extractDateFormatNew } from '../../utils/Timer'
import { useGetSupportCasesQuery } from '../../store/slices/supportApi'

const SupportCaseCard = ({ item, onPress }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  return (
    <View style={[s.cardContainer]}>
      <View style={[s.horizontalFlex]}>
        <TouchableOpacity onPress={() => setIsCollapsed((pre) => !pre)}>
          {isCollapsed ? <CollapseIcon /> : <ExpandIcon />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onPress(item.uid, item.id)}>
          <Text style={[g.title2, { color: colors.NORMAL }]}>{item?.uid}</Text>
        </TouchableOpacity>
      </View>
      {!isCollapsed && (
        <>
          <Text style={[g.body1, { color: colors.NORMAL, marginVertical: 4 }]}>
            {item?.subject}
          </Text>
          <View style={[s.horizontalFlex]}>
            <Text
              style={[
                g.gCardStatus,
                { marginRight: 8 },
                {
                  backgroundColor: item?.status && SupportStatus[item?.status]?.color,
                },
              ]}
            >
              {capitalizeFirstLetter(item?.status)}
            </Text>
            <Text style={[s.cardLevel]}>
              {item?.message ? 'Waiting for customer' : 'Waiting for support'}
            </Text>
          </View>
          <View style={[s.horizontalFlex]}>
            <Text style={[g.body2, { color: colors.PRIM_CAPTION, width: 90 }]}>Type:</Text>
            <Text style={[g.body2, { colors: colors.NORMAL }]}>
              {item?.active_support_case_type?.support_case_type?.name}
            </Text>
          </View>
          <View style={[s.horizontalFlex]}>
            <Text style={[g.body2, { color: colors.PRIM_CAPTION }]}>Date opened:</Text>
            <Text style={[g.body2, { colors: colors.NORMAL }]}>
              {extractDateFormatNew(item?.created_at)}
            </Text>
          </View>
        </>
      )}
    </View>
  )
}

const { height } = Dimensions.get('window')
const SupportListScreen = ({ navigation, route }) => {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  // const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])
  const { data: { data: supportCases = [] } = {}, isLoading: isFetchingCases } =
    useGetSupportCasesQuery({search: query});
  const handleCreateSupportCase = () => {
    navigation.navigate('CreateSupportCase')
  }
  const handleItemPress = (uid, id) => {
    navigation.navigate('SupportCasePage', { uid, id })
  }
  return (
    <SafeAreaView
      style={[
        { flex: 1, backgroundColor: colors.CONTAINER_BG },
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <CMidHeaderWithIcons
          onPress={() => navigation.goBack()}
          title="Support"
          containerStyle={{ paddingHorizontal: 16 }}
        >
          <MoreIcon fill={colors.ICON_BG} />
        </CMidHeaderWithIcons>
        <View style={{ paddingHorizontal: 16 }}>
          <CSearchInput
            placeholder="Search"
            value={search}
            setValue={setSearch}
            style={{ marginVertical: 8 }}
            isGSearch={true}
            searchIcon={true}
            // removing search value
            onPress={() => setSearch('')}
          />
        </View>
        {isFetchingCases && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size={'large'} color={colors.HOVER} />
          </View>
        )}
        {!isFetchingCases && (
          <FlatList
            data={supportCases}
            renderItem={({ item }) => <SupportCaseCard item={item} onPress={handleItemPress} />}
            keyExtractor={(item, index) => index}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 60,
            }}
          />
        )}
      </View>
      <TouchableOpacity style={s.plusButton} onPress={handleCreateSupportCase}>
        <FloatingPlusButton />
      </TouchableOpacity>
    </SafeAreaView>
  )
}
export default SupportListScreen
const s = StyleSheet.create({
  containerBG: {
    flex: 1,
    backgroundColor: colors.CONTAINER_BG,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    // marginTop: 24,
  },
  plusButton: {
    position: 'absolute',
    right: 0,
    zIndex: 100,
    bottom: Platform.OS === 'ios' && height > 670 ? 60 : 40,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 8,
    padding: 16,
  },
  horizontalFlex: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  cardLevel: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 40,
    backgroundColor: '#F2F6FF',
    color: '#246BFD',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
})
