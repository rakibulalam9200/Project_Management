import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AddCardScreen from '../../screens/Subscription/AddCardScreen'
import CustomizePlanScreen from '../../screens/Subscription/CustomizePlanScreen'
import PaymentScreen from '../../screens/Subscription/PaymentScreen'
import SubscriptionList from '../../screens/Subscription/SubscriptionList'
import StripePaymentScreen from '../../screens/Subscription/StripePaymentScreen'
import PaypalPaymentScreen from '../../screens/Subscription/PaypalPaymentScreen'
import AddPaymentMethodScreen from '../../screens/Subscription/AddPaymentMethodScreen'
import MyCards from '../../screens/Subscription/MyCards'
import EditPaymentMethod from '../../screens/Subscription/EditPaymentMethod'

const Stack = createNativeStackNavigator()

export default function SubscriptionStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SubscriptionList" component={SubscriptionList} />
      <Stack.Screen name="CustomizePlan" component={CustomizePlanScreen} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="StripePayment" component={StripePaymentScreen} />
      <Stack.Screen name="PaypalPayment" component={PaypalPaymentScreen} />
      <Stack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} />
      <Stack.Screen name="MyCards" component={MyCards} />
      <Stack.Screen name="EditPaymentMethod" component={EditPaymentMethod} />

    </Stack.Navigator>
  )
}
