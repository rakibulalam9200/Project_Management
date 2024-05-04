import { View, StyleSheet, ActivityIndicator, BackHandler, Alert, Text } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import CText from '../../components/common/CText'
import CInput from '../../components/common/CInput'
import CButton from '../../components/common/CButton'
import CDropdown from '../../components/common/CDropdown'
import EmailSentIcon from '../../assets/svg/email_sent.svg'

import { useSelector, useDispatch } from 'react-redux'
import auth from '../../assets/constants/auth'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import { checkSubscription, login as loginAction, logout } from '../../store/slices/auth'
import { changeCompany, setDomain } from '../../store/slices/user'
import { hasCompanyDomainErrors } from '../../utils/Errors'
import { isEmpty } from 'lodash'
import { getErrorMessage } from '../../utils/Errors'
import { useIsFocused } from '@react-navigation/native'
import { makeUnSubscribed, setNeedInitialSubscription, setNotNeedInitialSubscription, setPermissionLoading, setSubscriptionNeededNewOrg, setSubscriptionNotNeededNewOrg } from '../../store/slices/subscription'

const DomainSelect = ({ navigation }) => {
  const { user } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [errorMessages, setErrorMessages] = useState({
    domain: '',
  })

  const getItems = () => {
    return user.organizations.map(({ id, name }) => {
      return {
        id,
        content: name,
      }
    })
  }
  const [items, setItems] = useState(getItems)
  const [pickedDomain, setPickedDomain] = useState({})
  const isFocused = useIsFocused()

  useEffect(() => {
    if (isFocused) {
      dispatch(makeUnSubscribed())
      dispatch(setSubscriptionNotNeededNewOrg())
      dispatch(setNotNeedInitialSubscription())
    }
  }, [isFocused])

  const handleSignIn = async () => {
    if (hasCompanyDomainErrors(pickedDomain.content, setErrorMessages)) return false
    dispatch(changeCompany(pickedDomain.id))
      .then((res) => {
        //console.log({ res })
        if (res.success) {
          dispatch(checkSubscription())
        }
      })
      .catch((err) => {
        //console.log(err.response)
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occurred. Please try again later.'
        }
        Alert.alert(errorMsg)
      })
  }
  const handleLogout = async () => {
    await dispatch(logout())
  }




  if (!loading) {
    return (
      <View style={[g.container, s.container]}>
        <View style={s.containerMiddle}></View>
        <CText style={[g.h1, s.title]}>Hi, {user?.name} </CText>
        <CText style={s.infoText}>Please, select your company domain.</CText>
        <CDropdown
          placeholderText={'Select Company'}
          items={items}
          style={{ marginBottom: 15 }}
          setPickedItem={setPickedDomain}
          errorMessage={errorMessages?.domain}
        />

        <CButton onPress={handleSignIn} type={'white'}>
          <CText style={[g.button, s.btnText]}>Continue</CText>
        </CButton>
        <CButton onPress={handleLogout} type={'empty'} style={{ marginTop: 72 }}>
          <CText style={[g.button]}>
            <Text>← Cancel</Text>
          </CText>
        </CButton>
      </View>
    )
  }

  return (
    <View style={[g.container, s.container]}>
      <ActivityIndicator size="large" color={colors.WHITE} />
    </View>
  )
}

const s = StyleSheet.create({
  containerMiddle: {
    flexDirection: 'row',
    marginBottom: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: colors.NORMAL,
    padding: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 32,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 32,
  },
  input: {
    maxHeight: 64,
    marginBottom: 16,
    color: colors.WHITE,
  },
  termsText: {
    marginLeft: 8,
  },
  terms: {
    alignSelf: 'flex-start',
    marginBottom: 32,
  },
  btnText: {
    color: colors.WHITE,
  },
})

export default DomainSelect
