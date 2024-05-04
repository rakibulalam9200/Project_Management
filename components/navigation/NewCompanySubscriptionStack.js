import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AddCardScreen from '../../screens/Subscription/AddCardScreen'
import PaymentScreen from '../../screens/Subscription/PaymentScreen'
import SubscriptionList from '../../screens/Subscription/SubscriptionList'
import StripePaymentScreen from '../../screens/Subscription/StripePaymentScreen'
import PaypalPaymentScreen from '../../screens/Subscription/PaypalPaymentScreen'
import AddPaymentMethodScreen from '../../screens/Subscription/AddPaymentMethodScreen'
import MyCards from '../../screens/Subscription/MyCards'
import EditPaymentMethod from '../../screens/Subscription/EditPaymentMethod'
import CustomizePlanScreenForNewCompany from '../../screens/Subscription/CustomizePlanScreenForNewCompany'

const Stack = createNativeStackNavigator()

export default function NewCompanySubscriptionStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CustomizePlanForNewCompany" component={CustomizePlanScreenForNewCompany} />
      <Stack.Screen name="MyCards" component={MyCards} />
      <Stack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="EditPaymentMethod" component={EditPaymentMethod} />
      <Stack.Screen name="SubscriptionList" component={SubscriptionList} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
      <Stack.Screen name="StripePayment" component={StripePaymentScreen} />
      <Stack.Screen name="PaypalPayment" component={PaypalPaymentScreen} />

    </Stack.Navigator>
  )
}
