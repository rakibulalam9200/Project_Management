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
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import ArrowDownIcon from '../../assets/svg/arrow-down.svg'
import ArrowUpIcon from '../../assets/svg/arrow-up.svg'
import CheckboxFilledIcon from '../../assets/svg/cbchecked.svg'
import CButtonInput from '../../components/common/CButtonInput'
import IconWrap from '../../components/common/IconWrap'
import { makeSubscribed } from '../../store/slices/subscription'

const InitialCustomizePlanScreen = ({ navigation, route }) => {
  const iconWrapColors = [colors.SEC_BG, colors.MID_BG, colors.END_BG]
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [allPlan, setAllPlan] = useState([])
  const [loading, setLoading] = useState(false)
  const [modules, setModules] = useState([])
  const [planSettings, setPlanSettings] = useState([])
  const dispatch = useDispatch()
  const { user, domain, domainIndex } = useSelector((state) => state.user)

  const ModuleCard = ({ item }) => {
    const [expand, setExpand] = useState(false)
    const module = item
    return (
      <>
        <TouchableOpacity
          style={[
            s.planContainer,
            g.containerBetween,
            !expand ? { borderRadius: 10 } : { marginBottom: 0 },
          ]}
          onPress={() => {
            setExpand((prev) => {
              return !prev
            })
          }}
        >
          <View style={g.containerLeft}>
            <CheckboxFilledIcon />
            <Text style={s.moduleName}>{module.name}</Text>
          </View>
          <IconWrap
            outputRange={iconWrapColors}
            onPress={() => {
              setExpand((prev) => {
                return !prev
              })
            }}
          >
            {expand ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </IconWrap>
        </TouchableOpacity>
        {expand && (
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
  const activateTrial = () => {
    setLoading(true)
    api.subscription
      .activateTrial({
        organization_id: domainIndex,
      })
      .then((res) => {
        dispatch(makeSubscribed())
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
  }

  useEffect(() => {
    setLoading(true)
    api.subscription
      .getDefaultPlan()
      .then((res) => {
        setModules(res.modules)
        setPlanSettings(res.plan_settings)
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
      <View style={[g.outerContainer, s.containerBG,{marginBottom:16}]}>
        <Text style={s.welcomeText}>Welcome to Vida Projects</Text>
        <Text style={s.planText}>For Your Trial Plan the following modules will be activated.</Text>
        {loading && <ActivityIndicator size="small" color={colors.PRIM_BODY} />}

        <FlatList
          data={modules}
          keyExtractor={(item, index) => index.toString()}
          renderItem={(props) => <ModuleCard {...props} />}
          containerStyle={{
            flex: 1,
            flexDirection: 'row',
            paddingHorizontal: 10,
            backgroundColor: 'red',
          }}
        />

        <CButtonInput label="Activate Trial" loading={loading} onPress={activateTrial} />
      </View>
    </SafeAreaView>
  )
}

export default InitialCustomizePlanScreen

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
    marginTop:16,
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
})
