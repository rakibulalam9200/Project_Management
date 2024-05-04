import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CButtonInput from '../../components/common/CButtonInput'
import { setInitialPlan } from '../../store/slices/subscription'

const InitialPlanList = ({ navigation, route }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [subscriptionScreen, setSubscriptionScreen] = useState('subscription')
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [allPlan, setAllPlan] = useState([])
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const checkIfSelected = (plan) => {
    return selected.id == plan.id
  }

  const proceedToPayment = () => {
    if (selected.id != -1) {
      dispatch(setInitialPlan(selected))
      navigation.navigate('InitialPaymentMethod')
    } else {
      Alert.alert('Please select a plan first.')
    }
  }

  const toggleSelected = (plan) => {
    if (plan.id == selected.id) setSelected({ id: -1 })
    else {
      setSelected(plan)
    }
  }

  const PlanCard = ({ item }) => {
    const plan = item
    return (
      <TouchableOpacity
        style={[s.planContainer, checkIfSelected(plan) ? s.planContainerSelected : null]}
        onPress={() => toggleSelected(plan)}
      >
        {checkIfSelected(plan) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
        <View style={s.planContent}>
          <Text></Text>
          <View style={s.planMonth}>
            <Text style={s.planMonthText}>{plan.name}</Text>

            <Text style={s.weekContent}>{plan.trial_days} days free trial</Text>
          </View>
          <Text style={s.planAmount}>
            {plan.currency.name == 'usd' ? '$' : ''}
            {parseInt(plan.price).toFixed(2)} / {plan.billing_period}
          </Text>
          <Text style={s.planPerMonthText}>{plan.max_user} Users</Text>
        </View>
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    const body = {
      allData: true,
    }
    setLoading(true)
    api.subscription
      .getAllPlans(body)
      .then((res) => {
        setAllPlan(res)
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
  }, [])
  return (
    <SafeAreaView style={s.containerBG}>
      <StatusBar style="light" />
      <View style={[g.outerContainer, g.innerContainer, s.containerBG]}>
        <Text style={s.welcomeText}>Welcome to Vida Projects</Text>
        <Text style={s.planText}>To continue, please select your subscription plan.</Text>
        {loading && <ActivityIndicator size="small" color={colors.PRIM_BODY} />}

        <FlatList
          data={allPlan}
          keyExtractor={(item,index) => index.toString()}
          renderItem={PlanCard}
          containerStyle={{
            flex: 1,
            flexDirection: 'row',
            paddingHorizontal: 10,
            backgroundColor: 'red',
          }}
        />

        <CButtonInput label="Proceed to Payment" onPress={proceedToPayment} />
      </View>
    </SafeAreaView>
  )
}

export default InitialPlanList

const s = StyleSheet.create({
  containerBG: {
    flex: 1,
    backgroundColor: colors.NORMAL,
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
  outerPadding: {
    paddingHorizontal: 16,
    flex: 1,
    paddingBottom: 72,
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
  weekContent: {
    paddingHorizontal: 8,
    paddingVertical: 1,
    backgroundColor: colors.SEC_BG,
    color: colors.GREEN_NORMAL,
    borderRadius: 5,
  },
})
