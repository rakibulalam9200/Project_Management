import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import DeleteIcon from '../../assets/svg/delete_grey.svg'
import DotIcon from '../../assets/svg/dots.svg'
import DownloadIcon from '../../assets/svg/download.svg'
import MasterCardIcon from '../../assets/svg/mastercard.svg'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import VisaIcon from '../../assets/svg/visa.svg'
import CButtonInput from '../../components/common/CButtonInput'
import PaymentAcceptedModal from '../../components/modals/PaymentAcceptedModal'
import PaymentCardSettingsModal from '../../components/modals/PaymentCardSettingsModal'
import PdfPreviewModal from '../../components/modals/PdfPreviewModal'
import SubscriptionConfirmationModal from '../../components/modals/SubscriptionConfirmationModal'
import { downloadPdf } from '../../utils/DownloadAttachment'
import { getErrorMessage } from '../../utils/Errors'

const SubscriptionList = ({ navigation, route }) => {
  // const [refresh, setRefresh] = useState(route?.params?.refresh || false)
  // // const { refresh } = route.params || { refresh: false }
  // //console.log('refresh', refresh)
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [subscriptionScreen, setSubscriptionScreen] = useState('subscription')
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [allPlan, setAllPlan] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState(null)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [showSubscriptionConfirmationModal, setShowSubscriptionConfirmationModal] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [selectedOrganization, setSelectedOrganization] = useState(null)
  const [proceeding, setProceeding] = useState(false)
  const [paymentAcceptedModal, setPaymentAcceptedModal] = useState(false)
  const [refetch, setRefetch] = useState(false)
  const [modalFirstMessage, setModalFirstMessage] = useState(
    'You are about to renew your subscription'
  )
  const [modalSecondMessage, setModalSecondMessage] = useState({
    message: 'Please confirm your payment.',
  })
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedCard, setSelectedCard] = useState({ id: -1, name: '' })
  let { domainIndex } = useSelector((state) => state.user)
  const [openCardSettingsModal, setOpenCardSettingsModal] = useState(false)
  const [cardSettingsModalData, setCardSettingsModalData] = useState('')
  const [invoices, setInvoices] = useState([])
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [pdf, setPdf] = useState('')

  // Subscription plan card
  const SubscriptionCard = ({ item }) => {
    const subscriptionId = item?.id
    // //console.log('subscriptionId', subscriptionId)
    const organizationId = item?.organization_id
    const recurringPeriod = item?.plan_setting_payment_method?.month
    const recurringText = recurringPeriod == 1 ? 'month' : 'year'
    const amount = item?.total_amount
    const status = item?.status
    const users = item?.max_user
    const upgrade_user = item?.upgrade_user

    return (
      <View style={[s.planContainer]} onPress={() => { }}>
        <Text style={s.orgText}>{item?.organization?.name}</Text>
        <Text style={s.amountText}>
          ${Number(amount).toFixed(2)}/{recurringText}
        </Text>
        <View style={g.containerBetween}>
          <Text style={s.userText}>
            {users} user{users > 1 ? 's' : ''}
          </Text>

          {/* {
            upgrade_user > 0 &&

            <Text style={[s.userText, { color: colors.RED_NORMAL }]}>
              Due: {upgrade_user} user{upgrade_user > 1 ? 's' : ''}
            </Text>

          } */}

          <Text style={s.statusText}>{status}</Text>
        </View>
        <View style={[g.containerBetween, s.subActionContainer]}>
          {
            status == 'Cancelled' ? (
              <CButtonInput
                label="Renew"
                style={{ paddingVertical: 12 }}
                onPress={() => {
                  navigation.navigate('CustomizePlan', { subscriptionId, organizationId })
                }}
              />
            ) : status == 'Missed Payment' ? (
              <CButtonInput
                label="Pay Now"
                style={{ paddingVertical: 12, backgroundColor: colors.RED_NORMAL }}
                onPress={() => {
                  if (defaultPaymentMethod) {
                    setShowSubscriptionConfirmationModal(true)
                    setSelectedSubscription(subscriptionId)
                    setSelectedOrganization(organizationId)
                  } else {
                    // //console.log({ subscriptionId, organizationId })
                    navigation.navigate('MyCards', {
                      subscriptionId,
                      organizationId,
                      fromSubscriptionList: true,
                    })
                  }
                }}
              />
            ) : (
              <CButtonInput
                label="Edit Plan"
                style={{ paddingVertical: 10, paddingHorizontal: 40 }}
                onPress={() => {
                  navigation.navigate('CustomizePlan', { subscriptionId, organizationId })
                }}
              />
            )

            // payable_amount > 0 && upgrade_user > 0 ?

            //   <CButtonInput
            //     label={`Pay Now $${Number(payable_amount).toFixed(2)}`}
            //     style={{ paddingVertical: 12, backgroundColor: colors.RED_NORMAL }}
            //     onPress={() => {
            //       navigation.navigate('Payment',
            //         { data: { amount: payable_amount }, subscriptionId, organizationId, status, upgrade_user })
            //     }}
            //   />

            //   :

            // :
            // payable_amount > 0 && upgrade_user == 0 ?
            //   <View style={[s.editPayButtonContainer]}>
            //     <CButtonInput
            //       label="Edit Plan"
            //       style={{ paddingVertical: 12, marginRight: 10 }}
            //       onPress={() => {
            //         navigation.navigate('CustomizePlan', { subscriptionId, organizationId })
            //       }}
            //     />
            //     <CButtonInput
            //       label="Pay Now"
            //       style={{ paddingVertical: 12 }}
            //       onPress={() => {
            //         navigation.navigate('Payment', { data: { amount: payable_amount }, subscriptionId, organizationId, status, upgrade_user })
            //       }}
            //     />
            //   </View>
            //   :
            //   <></>
          }
          <TouchableOpacity>
            <DeleteIcon />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Payment option selection check
  const checkIfSelected = (paymentMethod) => {
    // //console.log({ selected })
    return selectedCard.id == paymentMethod.id
  }

  const toggleSelected = (paymentMethod) => {
    if (paymentMethod.id == selectedCard.id) setSelectedCard({ id: -1 })
    else {
      setSelectedCard(paymentMethod)
    }
  }

  // Payment option card
  const PaymentCard = ({ item }) => {
    const card = item

    return (
      <TouchableOpacity
        style={[s.cardsContainer, checkIfSelected(card) ? s.planContainerSelected : null]}
        onPress={() => toggleSelected(card)}
      >
        <View style={s.cardTextContent}>
          {checkIfSelected(card) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
          <View style={[s.cardTypeView]}>
            {item.card.brand == 'visa' ? <VisaIcon /> : <MasterCardIcon />}
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={s.cardText}>
              {item.card.brand == 'visa' ? 'Visa' : 'MasterCard'} xxxx {item.card.last4}
            </Text>
            <Text style={{ color: colors.PRIM_CAPTION }}>
              Expires on {item.card.exp_month}/{item.card.exp_year}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={{ padding: 10, backgroundColor: colors.WHITE, borderRadius: 40 }}
          onPress={() => {
            setCardSettingsModalData(card.id)
            setOpenCardSettingsModal(true)
          }}
        >
          <DotIcon />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  // Payment History Card

  const PaymentHistoryCard = ({ item }) => {
    return (
      <View style={s.invoiceCard}>
        <TouchableWithoutFeedback
          onPress={() => {
            setShowPdfModal(true)
            setPdf({ url: item?.invoice_pdf, name: item?.organization?.name })
          }}
        >
          <Text style={{ color: colors.SECONDARY, marginBottom: 5 }}>
            {item?.organization?.name}
          </Text>
          <Text style={{ fontSize: 12, color: colors.PRIM_CAPTION, marginBottom: 5 }}>
            {item?.payment_date}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '500' }}>Payment via {item?.method}</Text>
        </TouchableWithoutFeedback>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity
            onPress={async () => {
              // //console.log(item?.invoice_pdf)
              let message = await downloadPdf(item?.invoice_pdf, item?.organization?.name)
              if (message) {
                //console.log({ message })
                Alert.alert(message)
              }
            }}
          >
            <DownloadIcon />
          </TouchableOpacity>
          <Text style={{ fontWeight: '700' }}>
            {item?.plan_setting?.currency_sign}
            {parseFloat(item?.amount_paid).toFixed(2)}
          </Text>
        </View>
      </View>
    )
  }

  useEffect(() => {
    if (subscriptionScreen == 'subscription') {
      setLoading(true)
      api.subscription
        .getAllSubscriptions()
        .then((res) => {
          setSubscriptions(res.data)
          setDefaultPaymentMethod(res.default_payment_method)
          // //console.log('All Subscription plans', res.data)
        })
        .catch((err) => {
          //console.log(err.response.data)
          let errorMsg = ''
          try {
            errorMsg = getErrorMessage(err)
          } catch (err) {
            errorMsg = 'An error occured. Please try again later.'
          }
          Alert.alert(errorMsg)
        })
        .finally(() => {
          setLoading(false)
        })
    } else if (subscriptionScreen == 'cards') {
      setLoading(true)
      api.subscription
        .getPaymentMethods(domainIndex)
        .then((res) => {
          setPaymentMethods(res.data)
          setSelectedCard(res.data.find((item) => item.is_default == true)) // set default payment method checked
          // //console.log(res.data)
        })
        .catch((err) => {
          //console.log(err.response.data)
        })
        .finally(() => {
          setLoading(false)
        })
    } else if (subscriptionScreen == 'payment') {
      setLoading(true)
      api.subscription
        .getPaymentHistory()
        .then((res) => {
          setInvoices(res.data)
          //console.log(res.data[0])
        })
        .catch((err) => {
          //console.log(err.response.data)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [subscriptionScreen, isFocused, refetch])

  // make payment
  const makePayment = () => {
    // Making subscription with stripe
    setProceeding(true)
    let body = {
      organization_id: selectedOrganization,
      subscription_id: selectedSubscription,
    }
    //console.log('Making payment with stripe', body)

    api.subscription
      .makeStripeSubscription(body)
      .then((res) => {
        if (res.success) {
          //console.log('Stripe Subscription', res)
          setShowSubscriptionConfirmationModal(false)
          setPaymentAcceptedModal(true)
          // Alert.alert('You are subscribed to this plan')
          // navigation.navigate('SubscriptionList')
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
        Alert.alert(errorMsg)
      })
      .finally(() => {
        setProceeding(false)
      })
  }

  // go to my cards
  const goToMyCards = () => {
    //console.log({ selectedSubscription, selectedOrganization })
    setShowSubscriptionConfirmationModal(false)
    navigation.navigate('MyCards', {
      organizationId: selectedOrganization,
      subscriptionId: selectedSubscription,
    })
  }

  const goToSubscriptionList = () => {
    setPaymentAcceptedModal(false)
    setRefetch(!refetch)
  }

  // Make Default
  const makeDefault = (paymentMethod) => {
    //console.log(paymentMethod)
    api.subscription
      .makeDefaultPaymentMethod({ organization_id: domainIndex, payment_method: paymentMethod })
      .then((res) => {
        //console.log(res)
        if (res.success) {
          Alert.alert('Payment method set as default!')
          setRefetch(!refetch)
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
      })
  }

  // Delete Payment Method
  const deletePaymentMethod = (paymentMethod) => {
    api.subscription
      .deletePaymentMethod({ organization_id: domainIndex, payment_method: paymentMethod })
      .then((res) => {
        //console.log(res)
        if (res.success) {
          Alert.alert('Payment method deleted!')
          setRefetch(!refetch)
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
      })
  }

  return (
    <SafeAreaView style={[
      { flex: 1, backgroundColor: colors.CONTAINER_BG },
      { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    ]}>
      <PaymentAcceptedModal
        visibility={paymentAcceptedModal}
        setVisibility={setPaymentAcceptedModal}
        onPressOk={goToSubscriptionList}
      />
      <PdfPreviewModal visibility={showPdfModal} setVisibility={setShowPdfModal} details={pdf} />
      <SubscriptionConfirmationModal
        visibility={showSubscriptionConfirmationModal}
        setVisibility={setShowSubscriptionConfirmationModal}
        firstMessage={modalFirstMessage}
        message={modalSecondMessage}
        onPressOk={makePayment}
        proceeding={proceeding}
        clickHere={goToMyCards}
      />
      <PaymentCardSettingsModal
        visibility={openCardSettingsModal}
        setVisibility={setOpenCardSettingsModal}
        data={cardSettingsModalData}
        makeDefault={makeDefault}
        deleteCard={deletePaymentMethod}
        goToEditCard={() => {
          navigation.navigate('EditPaymentMethod', {
            paymentMethodId: cardSettingsModalData,
            organizationId: domainIndex,
          })
        }}
      />

      <View style={[g.outerContainer, s.outerPadding]}>
        <View style={s.headerContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack()
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>
          <View style={{ width: '70%', flex: 1 }}>
            <Text style={s.headerText}>Billing</Text>
          </View>
        </View>

        <View style={[g.containerBetween, s.subscriptionPickerContainer]}>
          <TouchableOpacity
            style={[
              s.paymentPickerButton,
              subscriptionScreen == 'subscription' ? s.subscriptionPickerButton : null,
            ]}
            onPress={() => {
              setSubscriptionScreen('subscription')
            }}
          >
            <Text
              style={[
                s.subscriptionPickerButtonText,
                subscriptionScreen == 'subscription' ? s.subscriptionPickerButtonTextActive : null,
              ]}
            >
              Subscriptions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              s.paymentPickerButton,
              subscriptionScreen == 'cards' ? s.subscriptionPickerButton : null,
            ]}
            onPress={() => {
              setSubscriptionScreen('cards')
            }}
          >
            <Text
              style={[
                s.subscriptionPickerButtonText,
                subscriptionScreen == 'cards' ? s.subscriptionPickerButtonTextActive : null,
              ]}
            >
              Cards
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              s.paymentPickerButton,
              subscriptionScreen == 'payment' ? s.subscriptionPickerButton : null,
            ]}
            onPress={() => {
              setSubscriptionScreen('payment')
            }}
          >
            <Text
              style={[
                s.subscriptionPickerButtonText,
                subscriptionScreen == 'payment' ? s.subscriptionPickerButtonTextActive : null,
              ]}
            >
              Invoices
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Lists */}
        {subscriptionScreen == 'subscription' && (
          <>
            {loading && <ActivityIndicator size="small" color={colors.PRIM_BODY} />}

            <FlatList
              data={subscriptions}
              keyExtractor={(item) => item.id}
              renderItem={(props) => <SubscriptionCard {...props} />}
              containerStyle={{
                flex: 1,
                flexDirection: 'row',
                paddingHorizontal: 10,
                backgroundColor: 'red',
              }}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}

        {/* Payment Methods */}
        {subscriptionScreen == 'cards' && (
          <ScrollView style={{ flex: 1 }}>
            <View>
              {loading ? (
                <ActivityIndicator size="small" color={colors.PRIM_BODY} />
              ) : paymentMethods.length == 0 ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: colors.PRIM_BODY }}>
                    No payment methods found for this organization!
                  </Text>
                </View>
              ) : (
                paymentMethods.map((card) => <PaymentCard key={card.id} item={card} />)
              )}
            </View>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 20,
                backgroundColor: colors.SEC_BG,
                paddingVertical: 20,
                borderRadius: 10,
              }}
              onPress={() =>
                navigation.navigate('AddPaymentMethod', {
                  organizationId: domainIndex,
                  fromSubscriptionList: true,
                })
              }
            >
              <View
                style={{
                  paddingVertical: 20,
                  paddingHorizontal: 30,
                  backgroundColor: colors.WHITE,
                  marginLeft: 20,
                  borderRadius: 5,
                }}
              ></View>
              <Text style={{ fontSize: 14, color: '#001D52', fontWeight: '700', marginLeft: 20 }}>
                Add Payment Method
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Payment History */}
        {subscriptionScreen == 'payment' && (
          <View>
            {loading && <ActivityIndicator size="small" color={colors.PRIM_BODY} />}

            {invoices.length == 0 && (
              <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.PRIM_BODY }}>
                  No payment history found!
                </Text>
              </View>
            )}

            <FlatList
              data={invoices}
              keyExtractor={(item) => item.id}
              renderItem={PaymentHistoryCard}
              style={{ marginBottom: 130 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default SubscriptionList

const s = StyleSheet.create({
  containerBG: {
    flex: 1,
    backgroundColor: colors.CONTAINER_BG,
  },
  subscriptionPickerContainer: {
    marginBottom: 20,
    borderRadius: 20,
  },
  paymentPickerButton: {
    width: '30%',
    borderRadius: 10,
    backgroundColor: colors.WHITE,
    paddingVertical: 8,
  },
  subscriptionPickerButton: {
    backgroundColor: colors.ICON_BG,
  },
  subscriptionPickerButtonText: {
    color: colors.BLACK,
    fontFamily: 'inter-regular',
    fontSize: 14,
    textAlign: 'center',
  },
  subscriptionPickerButtonTextActive: {
    color: colors.WHITE,
    fontWeight: '700',
  },
  container: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D6E2FF',
  },
  scrollWrapper: {
    flex: 1,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planText: {
    fontSize: 16,
    fontFamily: 'inter-regular',
    fontWeight: '700',
    color: colors.NORMAL,
    paddingVertical: 16,
  },
  outerPadding: {
    // paddingHorizontal: 16,
    flex: 1,
    paddingBottom: 72,
  },
  planContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: colors.WHITE,
    marginBottom: 16,
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
    fontWeight: '700',
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
    fontWeight: '700',
    fontSize: 14,
    paddingTop: 16,
    color: colors.PRIM_CAPTION,
  },
  weekContent: {
    paddingHorizontal: 8,
    paddingVertical: 1,
    backgroundColor: colors.SEC_BG,
    color: colors.GREEN_NORMAL,
    borderRadius: 5,
  },
  orgText: {
    fontFamily: 'inter-regular',
    fontWeight: '700',
    fontSize: 14,
    color: colors.NORMAL,
  },
  amountText: {
    fontFamily: 'inter-regular',
    fontWeight: '700',
    fontSize: 20,
    color: colors.NORMAL,
    marginVertical: 4,
  },
  userText: {
    fontFamily: 'inter-regular',
    fontWeight: '700',
    fontSize: 14,
    color: colors.GREEN_NORMAL,
    marginVertical: 6,
  },
  statusText: {
    fontFamily: 'inter-regular',
    fontWeight: '700',
    fontSize: 14,
    color: colors.WHITE,
    marginVertical: 4,
    backgroundColor: colors.GREEN_NORMAL,
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  subActionContainer: {
    marginVertical: 8,
  },

  editPayButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTextContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    fontFamily: 'inter-medium',
    fontSize: 14,
  },
  cardTypeView: {
    padding: 10,
    backgroundColor: colors.PRIM_BG,
    marginLeft: 10,
  },
  cardsContainer: {
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
  headerText: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
    color: '#000E29',
    // borderWidth: 1,
    textAlign: 'center',
  },
  invoiceCard: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: colors.WHITE,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
