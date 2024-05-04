import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch } from 'react-redux'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import Credit from '../../assets/svg/Credit.svg'
import Paypal from '../../assets/svg/paypal.svg'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CInitailHeader from '../../components/common/CInitialHeader'
import { setPaymentMethod } from '../../store/slices/subscription'

const cards = [
  {
    id: 1,
    name: 'Credit/Debit Card',
    icon: <Credit />,
  },
  {
    id: 2,
    name: 'Paypal',
    icon: <Paypal />,
  },
]

const InitialPaymentMethodScreen = ({ navigation, route }) => {
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [loading, setLoading] = useState(false)
  let refetch = route.params ? route.params?.refetch : null

  const dispatch = useDispatch()

  const checkIfSelected = (plan) => {
    return selected.id == plan.id
  }

  const goToPayment = () => {
    if (selected.id == -1) {
      Alert.alert('Please select a payment method.')
      return
    }
      dispatch(setPaymentMethod({}))

    navigation.navigate('InitialPayment')
  }

  const toggleSelected = (plan) => {
    if (plan.id == selected.id) setSelected({ id: -1 })
    else {
      setSelected(plan)
    }
  }

  const PlanCard = ({ item }) => {
    const card = item
    return (
      <TouchableOpacity
        style={[s.planContainer, checkIfSelected(card) ? s.planContainerSelected : null]}
        onPress={() => toggleSelected(card)}
      >
        <View style={s.cardTextContent}>
          {checkIfSelected(card) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
          <Text style={s.cardText}>{card.name}</Text>
        </View>

        <View>{card.icon}</View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={s.containerBG}>
      <StatusBar style="light" />
      <ScrollView style={{ flex: 1 }}>
        <View style={[s.outerContainer, s.outerPadding]}>
          <CInitailHeader title={'Welcome to Vida Projects'} />

          <Text style={[g.initailText, s.initialTextStyle]}>Please, select a payment method</Text>
          {cards.map((card) => (
            <PlanCard key={card.id} item={card} />
          ))}
          <CButtonInput
            label="Proceed to Payment"
            style={{ marginTop: 30 }}
            onPress={goToPayment}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default InitialPaymentMethodScreen

const s = StyleSheet.create({
  containerBG: {
    flex: 1,
    backgroundColor: colors.PRIM_BODY,
  },
  outerContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.PRIM_BODY,
  },
  initialTextStyle: {
    paddingVertical: 16,
    marginTop: 16,
  },
  subscriptionPickerContainer: {
    marginVertical: 20,
    borderRadius: 20,
    backgroundColor: colors.NORMAL,
  },
  paymentMethodCardBox: {
    width: 66,
    height: 46,
    backgroundColor: colors.SEC_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentPickerButton: {
    width: '50%',
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    paddingVertical: 8,
  },
  subscriptionPickerButton: {
    backgroundColor: colors.ICON_BG,
  },
  subscriptionPickerButtonText: {
    color: colors.BLACK,
    fontFamily: 'inter-regular',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '700',
  },

  scrollWrapper: {
    flex: 1,
  },
  headerLabelStyle: {
    fontSize: 16,
  },
  paymentMethodDetailsWrapper: {
    padding: 8,
  },
  paymentCardSubText: {
    fontFamily: 'inter-regular',
    fontSize: 14,
    fontWeight: '700',
    color: colors.PRIM_CAPTION,
  },
  paymentCardText: {
    fontFamily: 'inter-regular',
    fontSize: 14,
    fontWeight: '700',
  },
  paymentMethodText: {
    fontSize: 24,
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    color: colors.NORMAL,
    paddingTop: 8,
  },
  paymentMethodSubText: {
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    fontSize: 14,
    paddingVertical: 8,
    color: colors.PRIM_CAPTION,
  },
  outerPadding: {
    paddingHorizontal: 16,
    flex: 1,
    paddingBottom: 72,
  },
  scrollWrapper: {
    flex: 1,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 24,
  },
  planText: {
    fontSize: 16,
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    color: colors.NORMAL,
    paddingVertical: 16,
  },
  outerPadding: {
    paddingHorizontal: 16,
    flex: 1,
    paddingBottom: 72,
  },
  planContainer: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    borderRadius: 10,
    backgroundColor: colors.WHITE,
    marginBottom: 24,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planContainerSelected: {
    backgroundColor: colors.SEC_BG,
  },
  planContent: {
    marginLeft: 24,
    flex: 1,
  },
  cardTextContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    marginLeft: 5,
    fontFamily: 'inter-medium',
    fontSize: 18,
  },
})
