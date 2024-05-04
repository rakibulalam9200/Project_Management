import { View, Image, StyleSheet, Dimensions } from 'react-native'
import { useSelector } from 'react-redux'
import ContentLoader, { Rect } from 'react-content-loader/native'
import CText from './CText'
import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'

const width = Dimensions.get('window').width
const UserBlock = ({
  content = {
    status: '👋 Hello,',
  },
}) => {
  const user = useSelector((state) => state.user.value)
  if (user.first_name) {

    return (
      <View style={s.container}>
        <Image style={[s.avatar]} source={{ uri: user.avatar }} />
        <View style={{ maxWidth: '66%' }}>
          <CText numberOfLines={1} style={[g.footnote, s.statusText]}>{content.status}</CText>
          <CText numberOfLines={1} style={[g.title2, s.nicknameText]}>
            {(user.first_name + ' ' + user.last_name).length > 15
              ? user.first_name
              : user.first_name + ' ' + user.last_name}
          </CText>
        </View>
      </View>
    )
  }
  else {
    return (
      <ContentLoader
        speed={2}
        width={width - 46}
        height={52}
        viewBox={`0 0 ${width - 46} 52`}
        backgroundColor={colors.NORMAL}
        foregroundColor="#ecebeb"
      >
        <Rect x="60" y="3" rx="3" ry="3" width="52" height="16" />
        <Rect x="60" y="26" rx="3" ry="3" width="152" height="26" />
        <Rect rx="8" ry="8" width="52" height="52" />
      </ContentLoader>
    )
  }
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  avatar: {
    borderRadius: 8,
    height: 52,
    width: 52,
    marginRight: 8,
  },
  statusText: {
    color: colors.PRIM_BODY,
  },
  nicknameText: {
    color: 'black',
  },
})

export default UserBlock
