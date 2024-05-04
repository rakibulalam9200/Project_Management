import { StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import MoreIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'

const HearderWithTileBesideBackArrow = ({ title, navigation }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

  const goBack = () => {
    navigation.goBack()
  }
  return (
    <View
      style={[s.headerContainer]}
    >
      <View style={{ display: 'flex', flexDirection: 'row', gap: 5, alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => {
            goBack()
          }}
        >
          <BackArrow fill={colors.NORMAL} />
        </TouchableOpacity>
        <Text style={[g.body1]}>{title}</Text>
      </View>
      <View style={{}}>
        <TouchableOpacity
          onPress={() => {
            // setShowSettingsModal(true)
          }}
          outputRange={iconWrapColors}
          style={{}}
        >
          <MoreIcon fill={colors.NORMAL} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default HearderWithTileBesideBackArrow

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
        paddingHorizontal:16,
    // marginTop: 24,
  },
})
