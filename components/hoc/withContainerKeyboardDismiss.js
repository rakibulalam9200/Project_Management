import { StatusBar } from 'expo-status-bar'
import {
  Dimensions,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '../../assets/constants/colors'
import CustomStatusBar from '../common/CustomStatusBar'

const withContainerKeyboardDismiss = (WrappedComponent, {bgColor=null} ) => {
  const { height } = Dimensions.get('window')
  const ComponentWithScrollKeyboardDismissFixedBtn = (props) => {
    return (
      <SafeAreaView
        style={[
          { flex: 1, backgroundColor: bgColor || colors.WHITE},
          {
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
            paddingHorizontal: 16,
          },
        ]}
      >
        <CustomStatusBar barStyle="dark-content" backgroundColor={bgColor || colors.WHITE} />
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View
            style={{
              flex: 1,
              marginBottom: Platform.OS === 'ios' && height > 670 ? 80 : 64,
            }}
          >
            <WrappedComponent {...props} />
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    )
  }
  return ComponentWithScrollKeyboardDismissFixedBtn;
}

export default withContainerKeyboardDismiss;
