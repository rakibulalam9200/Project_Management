import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import { makeSubscribed } from '../../store/slices/subscription'
import {
  getErrorMessage,
  getOnlyErrorMessage,
  hasAddressErrors,
  hasCityErrors,
  hasCountryErrors,
  hasStateErrors,
  hasZipErrors
} from '../../utils/Errors'

const InitialPaymentScreen = ({ navigation, route }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [allPaymentMethods, setAllPaymentMethods] = useState([])
  const [loading, setLoading] = useState(false)
  let { domainIndex } = useSelector((state) => state.user)
  let refetch = route.params ? route.params?.refetch : null
  let { initialPlan, paymentMethod } = useSelector((state) => state.subscription)
  //console.log(paymentMethod,'payment method.....')

  const [cardHolderName, setCardHolderName] = useState('')

  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [sPayment, setSPayment] = useState('')

  const dispatch = useDispatch()
  const [errorMessages, setErrorMessages] = useState({
    name: '',
    country: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })

  const makeSubsciption = async () => {
    let plan_id = initialPlan?.id

    if (
      hasCountryErrors(country, setErrorMessages) ||
      hasCityErrors(city, setErrorMessages) ||
      hasZipErrors(zip, setErrorMessages) ||
      hasStateErrors(state, setErrorMessages) ||
      hasAddressErrors(address, setErrorMessages)
    )
      return

    try {
      setLoading(true)
      const body = {
        organization_id: domainIndex,
        plan_id: plan_id,
        payment_method: 'stripe', // TODO: add redux when paypal support is added to the api
        country: country,
        address: address,
        city: city,
        state: state,
        zip_code: zip,
      }
      // //console.log(body)
      const resSubscription = await api.subscription.planCheckout(body)
      //console.log(resSubscription)
      if (resSubscription.success) {
        if (resSubscription.trial_activate === 0) {
          const b = {
            organization_id: domainIndex,
            plan_id: plan_id,
          }
          const stripeSubscription = await api.subscription.stripeCheckout(b)
          if (stripeSubscription?.redirect_url) {
            navigation.navigate('StripePayment', { stripeUrl: stripeSubscription?.redirect_url })
          }
        } else {
          dispatch(makeSubscribed())
        }
      }
    } catch (err) {
      //console.log(err)
      //console.log(err.response)
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        //console.log(err)
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
      }
      Alert.alert(errorMsg)
    } finally {
      setLoading(false)
    }

    return
  }

  return (
    <SafeAreaView style={s.containerBG}>
      <StatusBar style="light" />
      <ScrollView style={{ flex: 1 }}>
        <View style={[g.outerContainer, g.innerContainer, s.containerBG]}>
          <Text style={s.welcomeText}>Welcome to Vida Projects</Text>
          <Text style={s.planText}>Payment Information</Text>

          <TouchableOpacity
            style={[s.planContainer, s.planContainerSelected]}
            // onPress={() => toggleSelected(plan)}
          >
            <RadioFilledIcon /> 
            <View style={s.planContent}>
              <Text></Text>
              <View style={s.planMonth}>
                <Text style={s.planMonthText}>{initialPlan.name}</Text>

                {/* <Text style={s.weekContent}>{plan.trial_days} days free trial</Text> */}
              </View>
              <Text style={s.planAmount}>
                {initialPlan.currency.name == 'usd' ? '$' : ''}
                {parseInt(initialPlan.price).toFixed(2)} / {initialPlan.billing_period}
              </Text>
              <Text style={s.planPerMonthText}>{initialPlan.max_user} Users</Text>
            </View>
          </TouchableOpacity>

          {/* <CInputWithLabel
            label="Name"
            value={cardHolderName}
            setValue={setCardHolderName}
            style={s.inputStyle}
            placeholder={'Card Holder Name'}
          /> */}
          <Text style={s.billingText}>Billing Address</Text>
          <CInputWithLabel
            value={country}
            setValue={setCountry}
            label="Country"
            placeholder="Country"
            style={s.inputStyle}
            required
            showErrorMessage
            errorMessage={errorMessages.country}
          />
          <CInputWithLabel
            value={address}
            setValue={setAddress}
            label="Street Address"
            placeholder="Address"
            style={s.inputStyle}
            required
            showErrorMessage
            errorMessage={errorMessages.address}
          />
          <CInputWithLabel
            value={city}
            setValue={setCity}
            label="City"
            placeholder="City"
            style={s.inputStyle}
            required
            showErrorMessage
            errorMessage={errorMessages.city}
          />
          <View style={[g.containerLeft]}>
            <CInputWithLabel
              value={state}
              setValue={setState}
              label="State"
              style={s.inputHalf}
              containerStyle={s.inputContainerStyle}
              required
              showErrorMessage
              errorMessage={errorMessages.state}
            />
            <CInputWithLabel
              value={zip}
              setValue={setZip}
              label="Zip"
              placeholder="______"
              style={s.inputHalf}
              containerStyle={s.inputContainerStyle}
              required
              showErrorMessage
              errorMessage={errorMessages.zip}
            />
          </View>
          <CButtonInput label="Pay" onPress={makeSubsciption} loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default InitialPaymentScreen

const s = StyleSheet.create({
  containerBG: {
    flex: 1,
    backgroundColor: colors.NORMAL,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 16,
  },

  scrollWrapper: {
    flex: 1,
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
  paymentMethodContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: colors.WHITE,
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodContainerSelected: {
    borderWidth: 2,
    borderColor: colors.HOVER,
    backgroundColor: colors.SEC_BG,
  },
  paymentMethodContent: {
    marginLeft: 24,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  billingText: {
    fontFamily: 'inter-regular',
    fontWeight: '700',
    fontSize: 24,
    paddingVertical: 8,
    color: colors.WHITE,
  },
  inputStyle: {
    backgroundColor: colors.WHITE,
  },
  inputHalf: {
    backgroundColor: colors.WHITE,
  },
  inputContainerStyle: {
    flex: 1,
    margin: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    color: colors.WHITE,
    textAlign: 'center',
    paddingVertical: 16,
  },
  planText: {
    fontSize: 16,
    fontFamily: 'inter-regular',
    color: colors.WHITE,
    textAlign: 'center',
    paddingVertical: 16,
  },

  planContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: colors.WHITE,
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  planContainerSelected: {
    borderWidth: 2,
    borderColor: colors.HOVER,
    backgroundColor: colors.SEC_BG,
  },
  planContent: {
    marginLeft: 24,
    flex: 1,
  },
  planMonth: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 14,
    fontFamily: 'inter-regular',
    fontWeight: '600',
  },
  planMonthText: {
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    fontSize: 14,
  },
  planAmount: {
    fontFamily: 'inter-regular',
    fontSize: 20,
    fontWeight: '700',
    paddingBottom: 16,
    borderBottomColor: colors.SEC_BG,
    borderBottomWidth: 1,
  },
  planPerMonthText: {
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    fontSize: 14,
    paddingTop: 16,
    color: colors.GREEN_NORMAL,
  },
})
