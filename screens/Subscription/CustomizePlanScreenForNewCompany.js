import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import ToggleSwitch from 'toggle-switch-react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import ArrowDownIcon from '../../assets/svg/arrow-down.svg'
import ArrowUpIcon from '../../assets/svg/arrow-up.svg'
import CheckboxFilledIcon from '../../assets/svg/cbchecked.svg'
import CheckboxEmptyIcon from '../../assets/svg/cbempty.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import IconWrap from '../../components/common/IconWrap'
import PaymentAcceptedModal from '../../components/modals/PaymentAcceptedModal'
import SubscriptionConfirmationModal from '../../components/modals/SubscriptionConfirmationModal'
import { logout } from '../../store/slices/auth'
import { makeSubscribed, setSubscriptionNotNeededNewOrg } from '../../store/slices/subscription'
import { getErrorMessage } from '../../utils/Errors'
import { extractPermissionsIdsFromRefForSubscriptionModules } from '../../utils/Permissions'

const defaultSelectedModules = {
  1: true,
  2: true,
}

const CustomizePlanScreenForNewCompany = ({ navigation, route }) => {
  const iconWrapColors = [colors.SEC_BG, colors.MID_BG, colors.END_BG]

  //   const subscriptionId = route.params ? route.params.subscriptionId : null
  //   const organizationId = route.params ? route.params.organizationId : null
  const { customDomainIndex } = useSelector((state) => state.user)
  const { subscriptionId } = useSelector((state) => state.subscription)
  //console.log(customDomainIndex, subscriptionId)
  const [subscriptionIdFromResponse, setSubscriptionIdFromResponse] = useState(null)
  const [organizationIdFromResponse, setOrganizationIdFromResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modules, setModules] = useState([])
  const [planSettings, setPlanSettings] = useState([])
  const [price, setPrice] = useState(50)
  const total_amount = useRef(0)
  const [maxUsers, setMaxUsers] = useState(40)
  const [activeUsers, setActiveUsers] = useState(30)
  const [orgName, setOrgName] = useState('Organization')
  const [paymentMethod, setPaymentMethod] = useState('month')
  const [refreshPrice, setRefreshPrice] = useState(false)
  const [payable_amount, setPayableAmount] = useState(0)
  const [remainingMonths, setRemainingMonths] = useState(0)
  const [remainingDays, setRemainingDays] = useState(0)
  const [showSubscriptionConfirmationModal, setShowSubscriptionConfirmationModal] = useState(false)
  const [subscriptionConfirmationModalData, setSubscriptionConfirmationModalData] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [proceeding, setProceeding] = useState(false)
  const [isPaymentMethodDisabled, setIsPaymentMethodDisabled] = useState(false)
  const [expand, setExpand] = useState(false)
  const [expandable, setExpandable] = useState([])
  const [paymentAcceptedModal, setPaymentAcceptedModal] = useState(false)
  const allUSers = useRef(0)
  const [storage, setStorage] = useState({
    defaultStorage: 0,
    storage: 0,
    usedStorage: 0,
  })
  const storageRef = useRef(0)

  const multipleSelect = useRef({
    ...defaultSelectedModules,
  })

  const incrementUsers = () => {
    setMaxUsers((prev) => {
      return prev + 1
    })
  }

  const decrementUsers = () => {
    setMaxUsers((prev) => {
      return prev - 1 >= activeUsers ? prev - 1 : prev
    })
  }
  const dispatch = useDispatch()
  const { domain } = useSelector((state) => state.user)

  const checkIfSelected = (id) => {
    if (multipleSelect.current[id]) return true
    else return false
  }
  // Module card component
  const ModuleCard = ({ item }) => {

    const toggleGlobalMultiselect = () => {
      if (!defaultSelectedModules[item.module_management_id]) {
        checkIfSelected(item.module_management_id)
        multipleSelect.current[item.module_management_id] = multipleSelect.current[item.module_management_id] ? undefined : true
        setRefreshPrice((prev) => !prev)
      }
    }
    const module = item
    return (
      <>
        <View
          style={[
            s.planContainer,
            g.containerBetween,
            expandable.indexOf(module.id) < 0 ? { borderRadius: 10 } : { marginBottom: 0 },
          ]}
        >
          <View style={g.containerLeft}>
            <TouchableOpacity onPress={toggleGlobalMultiselect}>
              {checkIfSelected(item.module_management_id) ? <CheckboxFilledIcon /> : <CheckboxEmptyIcon />}
            </TouchableOpacity>
            <Text style={s.moduleName}>{module.name}</Text>
          </View>
          <IconWrap
            outputRange={iconWrapColors}
            onPress={() => {
              //console.log('module id', module?.id)
              if (expandable.indexOf(module.id) < 0) {
                setExpandable([...expandable, module.id])
              } else {
                let idx = expandable.indexOf(module.id)
                expandable.splice(idx, 1)
              }
              setExpand((prev) => {
                return !prev
              })
            }}
          >
            {expandable.indexOf(module.id) > -1 ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </IconWrap>
        </View>
        {expandable.indexOf(module.id) > -1 && (
          <View style={s.featureContainer}>
            {module.features.map((feature) => {
              return (
                <Text key={feature.id} style={s.featureText}>
                  {feature.name}
                </Text>
              )
            })}
          </View>
        )}
      </>
    )
  }

  // fetch data
  useEffect(() => {
    setLoading(true)

    // Promise.all([
    //     api.subscription.getOrgSubscription(customDomainIndex, subscriptionId),
    //     api.subscription.getDefaultPlan(),
    // ])
    //     .then((values) => {
    //         let orgData = values[0]
    //         let allData = values[1]
    //         if (orgData.success) {
    //             orgData.data.owner_modules.forEach((module) => {
    //                 if (!defaultSelectedModules[module.module_management_id]) {
    //                     multipleSelect.current[module.module_management_id] = true
    //                 }
    //             })
    //         }
    //         // //console.log('orgData', orgData.data)
    //         setOrgName(orgData.data.organization.name)
    //         setMaxUsers(orgData.data.max_user)
    //         allUSers.current = orgData.data.max_user
    //         total_amount.current = Number(orgData.data.total_amount)
    //         // //console.log('total_amount.current', total_amount.current)
    //         setPayableAmount(parseInt(orgData.data.payable_amount))
    //         setRemainingMonths(parseInt(orgData.data.remaining_month))
    //         setRemainingDays(parseInt(orgData.data.remaining_days))
    //         setPaymentMethod(orgData.data.payment_method.id == 1 ? 'month' : 'year')
    //         setActiveUsers(orgData.data.active_user)
    //         setModules(allData.modules)
    //         setPlanSettings(orgData.plan_setting)
    //         setRefreshPrice((prev) => !prev)
    //     })
    //     .catch((err) => {
    //         //console.log('Here', err.response.data)
    //         let errorMsg = ''
    //         try {
    //             errorMsg = getErrorMessage(err)
    //         } catch (err) {
    //             errorMsg = 'An error occured. Please try again later.'
    //         }
    //         Alert.alert(errorMsg)
    //     })
    //     .finally(() => {
    //         setLoading(false)
    //     })

    api.subscription.getOrgSubscription(customDomainIndex, subscriptionId)
      .then((res) => {
        if (res.success) {
          res.data.owner_modules.forEach((module) => {
            // //console.log('module', module)
            if (!defaultSelectedModules[module.module.id]) {
              //console.log('module.module.id', module.module.id)
              multipleSelect.current[module.module.id] = true
            }
          })
          setOrgName(res.data.organization.name)
          setMaxUsers(res.data.max_user)
          allUSers.current = res.data.max_user
          total_amount.current = Number(res.data.total_amount)
          // setPayableAmount(parseInt(res.data.payable_amount))
          setRemainingMonths(parseInt(res.data.remaining_month))
          setRemainingDays(parseInt(res.data.remaining_days))
          setPaymentMethod(res.data.plan_setting_payment_method.payment_method_id == 1 ? 'month' : 'year')
          setActiveUsers(res.data.active_user)
          setPlanSettings(res.edit_data.plan_settings)
          setModules(res.edit_data.modules)
          setRefreshPrice((prev) => !prev)
          let defaultStorage = +(res.edit_data.plan_settings.default_storage)
          let storage = +(res.data.storage)
          let usedStorage = +(res.data.organization.org_subscription.used_storage)
          usedStorage /= (1024 * 1024 * 1024)
          usedStorage = usedStorage.toFixed(2)
          storageRef.current = +(res.data.storage)
          setStorage({ defaultStorage, storage, usedStorage })
          //console.log('res', res)
        }
      })
      .catch((err) => {
        //console.log(err)
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
  }, [])


  // Make Payment
  const makePayment = () => {
    // Making subscription with stripe
    setProceeding(true)
    let body = {
      organization_id: organizationIdFromResponse,
      subscription_id: subscriptionIdFromResponse,
    }
    //console.log('Making payment with stripe', body)

    api.subscription.makeStripeSubscription(body)
      .then((res) => {
        if (res.success) {
          //console.log('Stripe Subscription', res)
          setShowSubscriptionConfirmationModal(false)
          setPaymentAcceptedModal(true)
          // Alert.alert('You are subscribed to this plan')

          // navigation.navigate('SubscriptionList')
          // dispatch(setSubscriptionNotNeededNewOrg())
          // dispatch(makeSubscribed(true))
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
        if (err.response.data.default_payment_method == false) {
          goToMyCards()
        } else {

          let errorMsg = ''
          try {
            errorMsg = getErrorMessage(err)
          } catch (err) {
            errorMsg = 'An error occured. Please try again later.'
          }
          Alert.alert(errorMsg)
        }
      })
      .finally(() => {
        setProceeding(false)
      })

  }

  const goToMyCards = () => {

    setShowSubscriptionConfirmationModal(false)
    navigation.navigate('MyCards', {
      organizationId: customDomainIndex,
      subscriptionId: isPaymentMethodDisabled ? subscriptionId : subscriptionIdFromResponse,
      fromLoginUnsubscribed: true,
    })
  }

  // Unchanged plan make payment

  const unchangedPlanMakePayment = () => {
    setSubscriptionConfirmationModalData('Please confirm your payment.')
    setShowSubscriptionConfirmationModal(true)
    setOrganizationIdFromResponse(customDomainIndex)
    setSubscriptionIdFromResponse(subscriptionId)
  }

  // update organization subscription
  const updateOrgSubscription = () => {
    setPaymentLoading(true)
    let body = {
      organization_id: customDomainIndex,
      subscription_id: subscriptionId,
      max_user: maxUsers,
      total_amount: price,
      storage: storage.storage,
      plan_setting_payment_method_id: paymentMethod == 'month' ? 1 : 2,
      owner_modules: extractPermissionsIdsFromRefForSubscriptionModules(multipleSelect, modules),
    }
    // //console.log('ammount here', body)
    api.subscription
      .updateOrgSubscription(customDomainIndex, subscriptionId, body)
      .then((res) => {
        if (res.success) {
          //console.log('Saved Subscription', res.subscription.id)
          if (res.default_payment_method) {
            setSubscriptionConfirmationModalData(res.message)
            setShowSubscriptionConfirmationModal(true)
            setOrganizationIdFromResponse(res.subscription.organization_id)
            setSubscriptionIdFromResponse(res.subscription.id)
          } else {
            navigation.navigate('MyCards', { organizationId: customDomainIndex, subscriptionId: res.subscription.id })
          }
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
        setPaymentLoading(false)
      })
  }


  // Sum calculation of selected modules
  const calCulateSumOfModulesWeight = (modules) => {
    const sum = modules.reduce((acc, module) => {

      if (multipleSelect.current[module.module_management_id]) {
        return acc + parseInt(module.weight)
      } else {
        return acc
      }


    }, 0)
    // //console.log('Selected Moduels', multipleSelect.current)
    // //console.log('sum', sum)
    return sum
  }

  // Total amount calculation
  const getTotalAmount = (noOfUser, bpu, modules, noOfMonth, discount, storagePrice) => {
    const percentageModules = modules.filter((module) => module.type == 'percentage')
    const amountModules = modules.filter((module) => module.type == 'amount')
    // //console.log(noOfUser, bpu, noOfMonth, discount)
    let priceForModule = (bpu * calCulateSumOfModulesWeight(percentageModules)) / 100
    priceForModule += calCulateSumOfModulesWeight(amountModules)
    let totalPricePerMonth = (bpu + priceForModule) * noOfUser + storagePrice
    let totalAmount = ((totalPricePerMonth - ((totalPricePerMonth * discount) / 100)) * noOfMonth).toFixed(2)
    // //console.log('totalAmount', (Number(totalAmount)))
    return totalAmount
  }

  useEffect(() => {
    //console.log({ price, remainingMonths, remainingDays },)
    if (Number(price) === Number(total_amount.current)) {
      setIsPaymentMethodDisabled(true)
    } else {
      setIsPaymentMethodDisabled(false)
    }
  }, [price])

  // Refresh price on change of modules
  useEffect(() => {
    let basePrice = planSettings.bpu
    let storagePrice = 0
    if (storage.storage > storage.defaultStorage) {
      storagePrice = (storage.storage - storage.defaultStorage) * planSettings.extra_storage_price
    }
    let users = maxUsers
    let months = paymentMethod == 'month' ? 1 : 12
    let discount = paymentMethod == 'month' ? 0 : 13
    // if (maxUsers > allUSers.current && remainingMonths != 0) {
    //   // //console.log('here')
    //   users = maxUsers - allUSers.current
    //   months = remainingMonths
    // } else if (maxUsers > allUSers.current) {
    //   // //console.log('here2')
    //   users = maxUsers
    // }
    const totalAmount = getTotalAmount(users, basePrice, modules, months, discount, storagePrice)
    setPrice(totalAmount)


  }, [maxUsers, storage.storage, refreshPrice, allUSers.current, payable_amount])

  const handleLogOut = () => {
    dispatch(logout())
  }

  const goToHome = () => {
    setPaymentAcceptedModal(false)
    dispatch(setSubscriptionNotNeededNewOrg())
    dispatch(makeSubscribed(true))
  }


  const incrementStorage = () => {
    let stor = storage.storage
    stor = stor + 1
    setStorage((prev) => {
      return { ...prev, storage: stor }
    })
  }

  const decrementStorage = () => {
    let stor = storage.storage
    stor = stor - 1 >= 0 ? stor - 1 : 0
    setStorage((prev) => {
      return { ...prev, storage: stor }
    })
  }

  return (
    <SafeAreaView style={g.safeAreaStyleWithPrimBG}>
      <PaymentAcceptedModal
        visibility={paymentAcceptedModal}
        setVisibility={setPaymentAcceptedModal}
        onPressOk={goToHome}
      />
      <SubscriptionConfirmationModal
        visibility={showSubscriptionConfirmationModal}
        setVisibility={setShowSubscriptionConfirmationModal}
        firstMessage={'You are about to purchase this plan.'}
        message={{ message: subscriptionConfirmationModalData }}
        onPressOk={makePayment}
        proceeding={proceeding}
        clickHere={goToMyCards}
      />

      <StatusBar style="dark" />
      <View style={[g.outerContainer]}>
        <CHeaderWithBack
          title="Edit Plan"
          onPress={() => handleLogOut()}
          iconWrapColors={iconWrapColors}
          containerStyle={{ marginTop: 0 }}
        />
        <View>
          <Text style={s.welcomeText}>{orgName}</Text>
          <Text style={s.subText}>Choose Modules for your company</Text>
        </View>

        {loading ?
          <ActivityIndicator size="small" color={colors.PRIM_BODY} />
          :

          !loading && modules.length > 0 &&
          <View style={{ flex: 1, justifyContent: 'space-between', marginBottom: 20 }}>

            <ScrollView style={{ flex: 1, }} showsVerticalScrollIndicator={false}>
              {/* <FlatList
              data={modules}
              keyExtractor={(item) => item.id}
              renderItem={ModuleCard}
              showsVerticalScrollIndicator={false}
              style={{}}
            /> */}
              <View>


                {
                  modules.length > 0 && (

                    modules.map((module) => {
                      return <ModuleCard key={module.module_management_id} item={module} />
                    })

                  )}

                <View style={[s.bannerContainer]}>
                  <Text style={s.paymentMethodBanner}>Payment Method:</Text>
                  <View style={[{
                    paddingVertical: 16, borderBottomColor: colors.SEC_BG, borderBottomWidth: 1, flexDirection: 'row',
                    alignItems: 'center', gap: 20
                  },]}>
                    <Text style={[s.paymentMethodText, { marginRight: 5 }]}>Monthly</Text>
                    <ToggleSwitch
                      isOn={paymentMethod == 'year'}
                      onColor={colors.ICON_BG}
                      offColor={colors.ICON_BG}
                      labelStyle={{ color: 'black', fontWeight: '900' }}
                      size="medium"
                      onToggle={(isOn) => {
                        if (isOn) setPaymentMethod('year')
                        else setPaymentMethod('month')
                        setRefreshPrice((prev) => !prev)
                      }}
                      animationSpeed={150}
                    />
                    <Text style={[s.paymentMethodText, { marginLeft: 5 }]}>Yearly</Text>
                    <Text style={s.paymentMethodDiscountText}>13% OFF</Text>
                  </View>
                  <View style={[g.containerLeft, { paddingVertical: 10, }]}>
                    <Text style={s.paymentMethodBanner}>Used Licenses: </Text>
                    <Text style={s.numberText}>{activeUsers}</Text>
                  </View>
                  <View style={[g.containerLeft, { paddingBottom: 16, borderBottomColor: colors.SEC_BG, borderBottomWidth: 1 }]}>
                    <Text style={s.paymentMethodBanner}>Available Licenses: </Text>
                    <View style={{ flexDirection: 'row', gap: 5 }}>
                      <TouchableOpacity onPress={decrementUsers}>
                        <Text style={s.userMinus}>-</Text>
                      </TouchableOpacity>
                      <Text style={s.userText}>{maxUsers - activeUsers}</Text>
                      <TouchableOpacity onPress={incrementUsers}>
                        <Text style={s.userPlus}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View
                    style={[
                      g.containerLeft,
                      { paddingVertical: 10, },
                    ]}
                  >
                    <Text style={s.paymentMethodBanner}>Included Storage: </Text>
                    <Text style={s.numberText}>{storage.defaultStorage}GB</Text>
                  </View>

                  <View
                    style={[
                      g.containerLeft,
                      { paddingBottom: 10, },
                    ]}
                  >
                    <Text style={s.paymentMethodBanner}>Used Storage: </Text>
                    <Text style={s.numberText}>{storage.usedStorage}GB</Text>
                  </View>

                  <View
                    style={[
                      g.containerLeft,
                      { paddingBottom: 16, borderBottomColor: colors.SEC_BG, borderBottomWidth: 1 },
                    ]}
                  >
                    <Text style={s.paymentMethodBanner}>Add Storage: </Text>
                    <View style={{ flexDirection: 'row', gap: 5 }}>
                      <TouchableOpacity onPress={decrementStorage}>
                        <Text style={s.userMinus}>-</Text>
                      </TouchableOpacity>
                      <Text style={s.userText}>{storage.storage}</Text>
                      <TouchableOpacity onPress={incrementStorage}>
                        <Text style={s.userPlus}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={[g.containerLeft, { paddingTop: 16 }]}>
                    <Text style={[s.paymentMethodBanner]}>Your Price:</Text>

                    <Text style={s.priceText}>
                      ${Number(price).toFixed(2)}/{paymentMethod}
                    </Text>

                  </View>

                </View>
              </View>
            </ScrollView>
            <CButtonInput label={`${paymentLoading ? 'Please Wait..' : isPaymentMethodDisabled ? 'Pay' : 'Save and Pay'}`} onPress={isPaymentMethodDisabled ? unchangedPlanMakePayment : updateOrgSubscription} loading={paymentLoading} />
          </View>

        }
      </View>
    </SafeAreaView>
  )
}


export default CustomizePlanScreenForNewCompany

const s = StyleSheet.create({
  containerBG: {
    flex: 1,
    backgroundColor: colors.PRIM_BG,
    paddingHorizontal: 8,
    // paddingBottom: 60,
  },
  subscriptionPickerContainer: {
    marginVertical: 20,
    borderRadius: 20,
    backgroundColor: colors.WHITE,
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
  subscriptionPickerButtonTextActive: {
    color: colors.WHITE,
    fontWeight: 'bold',
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
    marginBottom: 24,
    marginTop: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    color: colors.NORMAL,
    paddingVertical: 16,
  },
  subText: {
    fontSize: 16,
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    color: colors.PRIM_CAPTION,
    paddingBottom: 16,
  },
  planText: {
    fontSize: 16,
    fontFamily: 'inter-regular',
    color: colors.WHITE,
    textAlign: 'center',
    paddingVertical: 16,
  },
  outerPadding: {
    paddingHorizontal: 16,
    flex: 1,
    paddingBottom: 72,
  },
  planContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopStartRadius: 10,
    borderTopEndRadius: 10,
    marginBottom: 16,
    backgroundColor: colors.WHITE,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleName: {
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
    textTransform: 'uppercase',
    color: colors.NORMAL,
  },
  featureContainer: {
    backgroundColor: colors.WHITE,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  featureText: {
    fontFamily: 'inter-regular',
    fontSize: 14,
  },
  userMinus: {
    backgroundColor: colors.SEC_BG,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    fontWeight: '700',
    fontSize: 24,
    overflow: 'hidden',
  },
  userPlus: {
    backgroundColor: colors.SEC_BG,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    fontWeight: '700',
    fontSize: 24,
    overflow: 'hidden',
  },
  userText: {
    backgroundColor: colors.SEC_BG,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignContent: 'center',
    color: colors.SIGN_IN_BTN_BG,
    fontWeight: '700',
    fontSize: 18,
    alignSelf: 'flex-start',
  },
  paymentMethodBanner: {
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.NORMAL,
  },
  bannerContainer: {
    paddingVertical: 10,
    marginBottom: 36,
    // flex: 1,
    // borderWidth: 1,
  },
  paymentMethodText: {
    fontFamily: 'inter-regular',
    fontSize: 16,
    color: colors.NORMAL,
  },
  paymentMethodDiscountText: {
    borderColor: colors.SIGN_IN_BTN_BG,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  numberText: {
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.SIGN_IN_BTN_BG,
  },
  priceText: {
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    fontSize: 22,
    color: colors.BLACK,
    marginLeft: 16,
    // marginTop: 8,
  },
})
