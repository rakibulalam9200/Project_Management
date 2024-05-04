import { Alert, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ children, permissionKey, navigation }) {
  const { permissions } = useSelector((state) => state.user)

  // //console.log(permissions,'permisssions...')

  const hasPermission = () => {
    let check = true
    for (let i of permissionKey) {
      if (!permissions[i]) {
        check = false
      }
    }
    return check
  }

  if (hasPermission()) {
    return children
  } else {
    Alert.alert('Unauthorized', 'You do not have enough privilege to perform this action.', [
      {
        text: 'OK',
        onPress: () => {
          navigation.goBack()
        },
      },
    ])
    return null
  }
}

const s = StyleSheet.create({
  text: {
    margin: 8,
    padding: 8,
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
  },
})
