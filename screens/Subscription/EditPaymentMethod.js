import React, { useEffect, useState } from 'react'
import {

  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,

  View,
  Alert,
  TouchableOpacity,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CButtonInput from '../../components/common/CButtonInput'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import {
  getErrorMessage,
  getOnlyErrorMessage,
  hasAddressErrors,
  hasCityErrors,
  hasCountryErrors,
  hasStateErrors,
  hasZipErrors,
} from '../../utils/Errors'
import AutoCompletePLace from '../../components/common/AutoCompletePLace'
import { createPaymentMethod, useStripe } from '@stripe/stripe-react-native'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import CountryPickerModal from '../../components/modals/CountryPickerModal'
import CheckedIcon from '../../assets/svg/cbchecked.svg'
import CheckedEmptyIcon from '../../assets/svg/cbempty.svg'
import CDisabledButton from '../../components/common/CDisabledButton'


const EditPaymentMethod = ({ navigation, route }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const payment_method = route?.params?.paymentMethodId
  const organizationId = route?.params?.organizationId
  const [loading, setLoading] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const stripe = useStripe()
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
  const [errorMessages, setErrorMessages] = useState({
    country: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })
  // let { domainIndex } = useSelector((state) => state.user)
  // //console.log('domainIndex', domainIndex)


  useEffect(() => {
    const params = {
      organizationId,
      payment_method,
    }
    api.subscription.getSinglePaymentMethod(organizationId, payment_method, params)
      .then((res) => {
        // //console.log('res', res)
        if (res.success) {
          //console.log('res', res)
          setCardDetails(res.data)
          setCountry({ index: 0, item: { name: res.data.billing_details.address.country, code: res.data.billing_details.address.country } })
          setCardHolderName(res.data.billing_details.name)
          setAddress(res.data.billing_details.address.line1)
          setCity(res.data.billing_details.address.city)
          setState(res.data.billing_details.address.state)
          setZip(res.data.billing_details.address.postal_code)

        }
      })
      .catch((err) => {
        //console.log('err', err.response.data)
      })
  }, [])




  // update payment method
  const updatePaymentCard = async () => {
    setLoading(true)
    const paymentMethodId = cardDetails.id
    const params = {
      payment_method: paymentMethodId,
      billing_details: {
        name: cardHolderName,
        email: 'email@stripe.com',
        phone: '+48888000888',
        address: {
          city: city,
          country_code: country.item.code,
          line1: address,
          state: state,
          postal_code: zip
        }
      },
      card: {
        exp_month: cardDetails.card.exp_month,
        exp_year: cardDetails.card.exp_year,
      }
    }

    api.subscription.updatePaymentMethod(paymentMethodId, params)
      .then((res) => {
        //console.log('res', res)
        Alert.alert('Payment Method Updated Successfully')
        navigation.goBack()
      })
      .catch((err) => {
        //console.log('err', err.response.data)
        Alert.alert('An error occured. Please check all the fields and try again.')
      })
      .finally(() => {
        setLoading(false)
      })


  }


  const checkIfAgreed = () => {
    if (!agreeTerms) {
      return false
    }
    return true
  }

  const toggleAgree = () => {
    setAgreeTerms(!agreeTerms)
  }

  useEffect(() => {
    //console.log({ address })
  }, [address])

  return (
    <SafeAreaView style={s.containerBG}>
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='always' nestedScrollEnabled={true} horizontal={false}>
        <View style={[g.outerContainer, s.outerPadding]}>
          <CHeaderWithBack
            title={'Edit Payment Method'}
            labelStyle={s.headerLabelStyle}
            iconWrapColors={iconWrapColors}
            onPress={() => {
              navigation.goBack()
            }}
          />



          <CountryPickerModal
            visibility={showCountryPickerModal}
            setVisibility={setShowCountryPickerModal}
            selected={country}
            setSelected={setCountry}
          />
          <View style={{ marginTop: 10 }}>
            <CInputWithLabel
              label="Name"
              value={cardHolderName}
              editable={false}
              placeholder="Cardholder Name"
              style={s.inputStyle}
            />


            <CInputWithLabel
              label='Card Number'
              style={s.inputStyle}
              value={cardDetails?.card?.last4 ? 'xxxx ' + cardDetails?.card?.last4 : ''}
              editable={false}
            />

            <View style={[s.stateZipContainer]}>

              <CInputWithLabel
                value={cardDetails?.card?.exp_month ? cardDetails?.card?.exp_month + '/' + cardDetails?.card?.exp_year : ''}
                editable={false}
                label="Expiration"
                placeholder="__/__"
                style={s.inputHalf}
                containerStyle={s.inputContainerStyle}

              />


              <CInputWithLabel
                value={'xxx'}
                editable={false}
                label="CVV"
                placeholder="_ _ _"
                style={s.inputHalf}
                containerStyle={s.inputContainerStyle}

              />
            </View>

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
            onPress={() => toggleAgree()}
          >
            {checkIfAgreed() ? <CheckedIcon /> : <CheckedEmptyIcon />}
            <Text style={{ marginLeft: 10, fontWeight: '500' }}>I have read and agree the </Text>
            <Text style={{ fontWeight: '500', color: colors.SECONDARY }}>Terms of Use</Text>
          </TouchableOpacity>

          {
            agreeTerms ?
              <CButtonInput label="Save" onPress={updatePaymentCard} loading={loading} />
              :
              <CDisabledButton label="Save" disbale={true} />
          }

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default EditPaymentMethod

const s = StyleSheet.create({
  containerBG: {
    flex: 1,
    backgroundColor: colors.CONTAINER_BG,
  },
  agreeTermsContainer: {
    paddingHorizontal: 16,
    height: 30,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.SEC_BG,
    marginBottom: 10,
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
  inputStyle2: {
    backgroundColor: colors.WHITE,
    width: '100%',
    flex: 1,
    borderWidth: 1,
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
