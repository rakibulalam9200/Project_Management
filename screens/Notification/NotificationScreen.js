import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import CText from '../../components/common/CText'

import moment from 'moment-mini'
import { ActivityIndicator } from 'react-native'
import { useDispatch } from 'react-redux'
import ArrowRightIcon from '../../assets/svg/arrow-right-blue.svg'
import MoreIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import IconWrap from '../../components/common/IconWrap'
import useNotification from '../../hooks/Notification/useNotification'
import { setCurrentProject, setNavigationFrom } from '../../store/slices/navigation'
import { getInitialNameLetters } from '../../utils/Strings'
export default function NotificationScreen({ navigation }) {
  const { loading, notifications } = useNotification()
  const dispatch = useDispatch()
  const goToScreen = (item) => {
    if (item?.type == 'Project') {
      dispatch(setCurrentProject({ id: item?.notificationable_id }))
      dispatch(setNavigationFrom('Notification'))
      navigation.navigate('ProjectDetails', {
        id: item?.notificationable_id,
      })
    }
  }
  const NotificationCard = ({ item }) => (
    <TouchableOpacity style={s.notificationCardContainer} onPress={() => goToScreen(item)}>
      <View style={s.notificationNameBox}>
        <Text style={s.notificationNameBoxText}>{getInitialNameLetters(item?.user?.name)}</Text>
      </View>
      <View style={s.descriptionBox}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={s.descriptionText}>Event Description: {item?.description}</Text>
        </View>
        <Text style={s.timeText}>{moment(new Date(item.created_at)).fromNow()}</Text>
      </View>
      <IconWrap outputRange={[colors.WHITE, colors.MID_BG, colors.END_BG]}>
        <ArrowRightIcon />
      </IconWrap>
    </TouchableOpacity>
  )
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.PRIM_BG }}>
      <StatusBar backgroundColor={colors.CONTAINER_BG} />
      {/* Container Start*/}
      <View style={[g.outerContainerPadding]}>
        {/* Header */}
        <View style={[s.headerContainer]}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack()
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>
          <CText style={[g.body1, s.textColor]}>Notifications</CText>
          <View style={s.buttonGroup}>
            <TouchableOpacity>
              <MoreIcon fill={colors.NORMAL} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Header End */}
        {!loading && notifications.length == 0 && (
          <Text style={[{ textAlign: 'center' }]}>No Notifications to show.</Text>
        )}
        {loading && <ActivityIndicator color={colors.NORMAL} />}

        <FlatList
          data={notifications}
          renderItem={NotificationCard}
          keyExtractor={(item) => item.id}
        />
      </View>
      {/* Container End */}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.PRIM_BG,
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },

  notificationCardContainer: {
    padding: 16,
    borderTopColor: colors.SEC_BG,
    width: '100%',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationNameBox: {
    backgroundColor: colors.NORMAL,
    width: 66,
    height: 66,
    borderRadius: 10,
    justifyContent: 'center',
    alignContent: 'center',
  },
  notificationNameBoxText: {
    color: colors.WHITE,
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  descriptionBox: {
    flex: 1,
    padding: 16,
  },

  descriptionText: {
    flexShrink: 1,
    fontFamily: 'inter-regular',
    fontSize: 14,
    color: colors.NORMAL,
  },
  timeText: {
    color: colors.PRIM_CAPTION,
  },
})
