import { CardField, createPaymentMethod } from '@stripe/stripe-react-native'
import React, { useEffect, useState } from 'react'
import {
  Alert, SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CheckedIcon from '../../assets/svg/cbchecked.svg'
import CheckedEmptyIcon from '../../assets/svg/cbempty.svg'
import AutoCompletePLace from '../../components/common/AutoCompletePLace'
import CButtonInput from '../../components/common/CButtonInput'
import CDisabledButton from '../../components/common/CDisabledButton'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import HideKeyboard from '../../components/common/HideKeyboard'
import CountryPickerModal from '../../components/modals/CountryPickerModal'
import { setIsAgreeTerms } from '../../store/slices/auth'
import {
  getErrorMessage
} from '../../utils/Errors'

const PaymentScreen = ({ navigation, route }) => {
  const { isAgreeTerms } = useSelector((state) => state.auth)
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [loading, setLoading] = useState(false)
  const fromSubscriptionList = route?.params?.fromSubscriptionList ? true : false

  // let { domainIndex } = useSelector((state) => state.user)

  // let refetch = route.params ? route.params?.refetch : null
  // let { currentPlan } = useSelector((state) => state.subscription)
  const [showCountryPickerModal, setShowCountryPickerModal] = useState(false)
  const [country, setCountry] = useState({ index: -1, item: '' })
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const dispatch = useDispatch()
  const [cardHolderName, setCardHolderName] = useState('')
  const [cardDetails, setCardDetails] = useState({})
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [errorMessages, setErrorMessages] = useState({
    country: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })
  // let { domainIndex } = useSelector((state) => state.user)
  const organizationId = route?.params?.organizationId
  // //console.log('domainIndex', domainIndex)

  // const makeSubsciption = async () => {
  //   let paymentMethod = selected.id
  //   let subscription_id = route.params.subscriptionId
  //   let organization_id = route.params.organizationId
  //   let status = route.params?.status
  //   let upgrade_user = route.params?.upgrade_user
  //   let upgrade_user_status = upgrade_user > 0 ? 'Upgrade' : 'Downgrade'
  //   //console.log('upgrade_user_status', upgrade_user_status)
  //   let body = {}
  //   if (paymentMethod == -1) {
  //     Alert.alert('Please select a payment method first')
  //     return
  //   }

  //   if (
  //     hasCountryErrors(country, setErrorMessages) ||
  //     hasCityErrors(city, setErrorMessages) ||
  //     hasZipErrors(zip, setErrorMessages) ||
  //     hasStateErrors(state, setErrorMessages) ||
  //     hasAddressErrors(address, setErrorMessages)
  //   )
  //     return

  //   if (status === 'Upgrade' || status === 'Downgrade') {

  //     body = {
  //       organization_id,
  //       subscription_id,
  //       status,
  //       country: country,
  //       address: address,
  //       city: city,
  //       state: state,
  //       zip_code: zip,
  //     }

  //   } else {

  //     body = {
  //       organization_id,
  //       subscription_id,
  //       status: upgrade_user_status,
  //       country: country,
  //       address: address,
  //       city: city,
  //       state: state,
  //       zip_code: zip,
  //     }
  //   }


  //   //console.log('All info -> ', body)

  //   if (paymentMethod === 1) {
  //     //console.log('Stripe payment')
  //     api.subscription.stripeCheckout(body)
  //       .then(res => {
  //         //console.log('Stripe response ', res?.redirect_url)
  //         if (res?.redirect_url) {
  //           navigation.navigate('StripePayment', { stripeUrl: res?.redirect_url, status: upgrade_user_status })
  //         }
  //       })
  //       .catch(err => {
      // //console.log(err.response.data)
  //   } else if (paymentMethod === 2) {
  //     //console.log('Paypal')
  //     api.subscription.paypalCheckout(body)
  //       .then(res => {
  //         //console.log('Paypal response response ', res?.redirect_url)
  //         if (res?.redirect_url) {
  //           navigation.navigate('PaypalPayment', { paypalUrl: res?.redirect_url, status: upgrade_user_status })
  //         }
  //       })
  //       .catch(err => {
    //  //console.log(err.response.data)

  //   }

  // }


  // useEffect(() => {
  //   //console.log({ city, country, address, state, zip })
  // }, [city, country, address, state, zip])



  // Add payment method

  const addPaymentCard = async () => {
    setLoading(true)
    // const billingDetails = {
    //   name: cardHolderName,
    //   email: 'email@stripe.com',
    //   phone: '+48888000888',
    //   addressCity: city,
    //   addressCountry: country.item.code,
    //   addressLine1: address,
    //   addressLine2: '',
    //   addressPostalCode: zip,
    //   addressState: state,
    // };
    const billingDetails = {
      name: cardHolderName,
      email: 'email@stripe.com',
      phone: '+48888000888',
      address: {
        city: city,
        country: country.item.code,
        line1: address,
        line2: '',
        postalCode: zip,
        state: state,
      }
    };


    const { paymentMethod, error } = await createPaymentMethod(
      {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: billingDetails
        }

      }
    )
    if (error) {
      //console.log('error', error)
      setLoading(false)
      Alert.alert(error.message)
      return
    }
    else {
      //console.log('paymentMethod', paymentMethod)
      try {
        const { id } = paymentMethod
        const res = await api.subscription.stripeAttachCard({ organizationId: organizationId, payment_method: id }, organizationId)
        //console.log('data', res)
        if (res.success) {
          Alert.alert('Payment Method Attached Successfully')
          setLoading(false)
          if (fromSubscriptionList) {

            navigation.navigate('SubscriptionList')
          } else {

            navigation.navigate('MyCards')
          }
          // setCardDetails(paymentMethod)
        }
      }
      catch (err) {
        //console.log('err', err.response.data)
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
        Alert.alert(errorMsg)
        setLoading(false)
      }
      // setCardDetails(paymentMethod)
    }

  }

  const checkIfAgreed = (item) => {
    if (item === 'terms') {
      if (agreeTerms) {
        return true
      } else {
        return false
      }
    }
  }

  // const checkIfAgreed = () => {
  //   if (!agreeTerms) {
  //     return false
  //   }
  //   return true
  // }

  const toggleAgree = (item) => {
    if (item === 'terms') {
      setAgreeTerms(!agreeTerms)
      dispatch(setIsAgreeTerms(!agreeTerms))
    } else if (item === 'privacy') {
      setAgreePrivacy(!agreePrivacy)
    }
  }

  useEffect(() => {
    if (isAgreeTerms) {
      setAgreeTerms(true)
    } else {
      setAgreeTerms(false)
    }
  }, [isAgreeTerms])

  // const toggleAgree = () => {
  //   setAgreeTerms(!agreeTerms)
  // }

  return (
    <HideKeyboard>

      <SafeAreaView style={g.safeAreaStyleWithPrimBG}>
        <CHeaderWithBack
          title={'Payment Details'}
          labelStyle={s.headerLabelStyle}
          iconWrapColors={iconWrapColors}
          containerStyle={{ marginTop: 0, paddingHorizontal: 16 }}
          onPress={() => {
            navigation.goBack()
          }}
        />
        <ScrollView 
          style={{ flex: 1 }} 
          keyboardShouldPersistTaps='always'
          nestedScrollEnabled={true} 
          horizontal={false}
          automaticallyAdjustKeyboardInsets={true}>
          <View style={[g.outerContainer, s.outerPadding]}>


            <CountryPickerModal
              visibility={showCountryPickerModal}
              setVisibility={setShowCountryPickerModal}
              selected={country}
              setSelected={setCountry}
            />
            <View style={{}}>
              <CInputWithLabel
                label="Name"
                value={cardHolderName}
                setValue={setCardHolderName}
                placeholder="Cardholder Name"
                style={s.inputStyle}
              />

              <CardField
                style={s.cardField}
                postalCodeEnabled={false}
                countryCode={'US'}
                onCardChange={(cardDetails) => setCardDetails(cardDetails)}
              />

            </View>


            <Text style={s.billingText}>Billing Address</Text>


            <CSelectWithLabel
              label="Country"
              onPress={() => setShowCountryPickerModal(true)}
              selectText={country.id != -1 ? country.item.name : 'Select'}
              style={{ backgroundColor: '#fff' }}
            />


            <ScrollView horizontal={true} style={{ width: '100%', flex: 1, flexDirection: 'column', marginVertical: 10 }} keyboardShouldPersistTaps='always'>

              <View style={{ flex: 1, width: '100%' }}>
                <Text style={s.labelStyle}>Street Address</Text>
                <AutoCompletePLace
                  value={address}
                  setValue={setAddress}
                  placeholder={'Street'}
                  setLocality={setCity}
                  setState={setState}
                  setPostalCode={setZip}
                  type=''
                  bgWhite />
              </View>

            </ScrollView>



            <ScrollView horizontal={true} style={{ width: '100%', flex: 1, flexDirection: 'column', marginVertical: 10 }} keyboardShouldPersistTaps='always'>

              <View style={{ flex: 1, width: '100%' }}>
                <Text style={s.labelStyle}>City</Text>
                <AutoCompletePLace
                  setValue={setCity}
                  placeholder={'City'}
                  value={city}
                  type='regions'
                  bgWhite />
              </View>

            </ScrollView>


            <View style={[s.stateZipContainer]}>

              <ScrollView horizontal={true} style={{ width: '100%', flex: 1, flexDirection: 'column', marginVertical: 10 }} keyboardShouldPersistTaps='always'>

                <View style={{ flex: 1, width: '100%' }}>
                  <Text style={s.labelStyle}>State</Text>
                  <AutoCompletePLace
                    setValue={setState}
                    placeholder={'State'}
                    value={state}
                    type='regions'
                    bgWhite />
                </View>

              </ScrollView>


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

            <TouchableOpacity
              style={[s.agreeTermsContainer]}
              onPress={() => toggleAgree('terms')}
            >
             {checkIfAgreed('terms') ? <CheckedIcon /> : <CheckedEmptyIcon />}
              <Text style={{ marginLeft: 10, fontWeight: '500' }}>I have read and agree the </Text>
              <TouchableOpacity onPress={() => navigation.navigate('TermsScreen',{navFrom:'payment'})}>
                <Text style={{ fontWeight: '500', color: colors.SECONDARY }}>Terms of Use</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <Text style={{ fontSize: 13, fontWeight: '400', paddingHorizontal: 16, textAlign: 'justify', marginBottom: 10 }}>
              There are no refunds. Your subscription will renew automatically, and you will be charged in advance. You may cancel at any time. The cancellation goes into effect at the start of your following billing cycle.
            </Text>

            {
              agreeTerms ?
                <CButtonInput label="Add New Payment Method" onPress={addPaymentCard} loading={loading} />
                :
                <CDisabledButton label="Add New Payment Method" disbale={true} />
            }
          </View>
        </ScrollView>
      </SafeAreaView>
    </HideKeyboard>
  )
}

export default PaymentScreen

const s = StyleSheet.create({
  containerBG: {
    flex: 1,
    backgroundColor: colors.CONTAINER_BG,
  },
  agreeTermsContainer: {
    paddingHorizontal: 16,
    height: 30,
    // borderWidth: 1,
    // borderBottomColor: colors.SEC_BG,
    // marginBottom: 10,
    flexDirection: 'row',
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
  subscriptionPickerContainer: {
    marginVertical: 20,
    borderRadius: 20,
    backgroundColor: colors.WHITE,
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
  cardField: {
    width: '100%',
    height: 60,
    borderRadius: 20,
    marginVertical: 16,
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
    color: colors.PRIM_BODY,
  },

  amountText: {
    fontFamily: 'inter-regular',
    fontWeight: '700',
    fontSize: 20,
    paddingVertical: 8,
    color: colors.PRIM_BODY,
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
  labelStyle: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
    marginBottom: 4,
  },
  stateZipContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
})
