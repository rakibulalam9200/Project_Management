import { createNativeStackNavigator } from '@react-navigation/native-stack'
import InitialCustomizePlanScreen from '../../screens/InitialSubscription/InitialCustomizePlanScreen'
import InitialPaymentMethodScreen from '../../screens/InitialSubscription/InitialPaymentMethodScreen'
import InitialPaymentScreen from '../../screens/InitialSubscription/InitialPaymentScreen'
import InitialPlanList from '../../screens/InitialSubscription/InitialPlanList'
import StripePaymentScreen from '../../screens/InitialSubscription/StripePaymentScreen'

const Stack = createNativeStackNavigator()

export default function InitialSubscriptionStack() {
  //console.log('this stack will be loaded...')
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="InitialPlanList"
    >
      <Stack.Screen name="InitialCustomizePlan" component={InitialCustomizePlanScreen} />
      <Stack.Screen name="InitialPaymentMethod" component={InitialPaymentMethodScreen} />
      <Stack.Screen name="InitialPayment" component={InitialPaymentScreen} />
      {/* <Stack.Screen name="StripePayment" component={StripePaymentScreen} /> */}
    </Stack.Navigator>
  )
}
