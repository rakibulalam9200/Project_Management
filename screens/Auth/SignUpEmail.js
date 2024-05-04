import { useEffect, useState } from 'react'
import {
  Alert,
  BackHandler,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useDispatch, useSelector } from 'react-redux'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CheckedIcon from '../../assets/svg/cbchecked.svg'
import CheckedEmptyIcon from '../../assets/svg/cbempty.svg'
import CButton from '../../components/common/CButton'
import CInput from '../../components/common/CInput'
import CText from '../../components/common/CText'
import useIsMounted from '../../hooks/useIsMounted'
import { registration, setIsAgreeTerms } from '../../store/slices/auth'
import { getErrorMessage, hasDomainErrors, hasEmailErrors } from '../../utils/Errors'

const SignUpEmail = ({ setStep, navigation }) => {
  const mounted = useIsMounted()
  const dispatch = useDispatch()
  const { isAgreeTerms, isAgreePrivacy } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [companyDomain, setCompanyDomain] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  //console.log(agreeTerms, 'agreeTerms')
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [errorMessages, setErrorMessages] = useState({
    domain: '',
    userName: '',
    email: '',
  })

  const handleBackClick = () => {
    navigation.replace('SignIn')
    return true
  }

  const onSignUp = () => {
    //console.log('sign up')
    if (
      hasDomainErrors(companyDomain, setErrorMessages) ||
      hasEmailErrors(email, setErrorMessages)
    ) {
      return
    }

    if (!agreeTerms) {
      Alert.alert('Please agree to the Terms and Privacy Policy')
      return
    }

    const body = {
      email: email,
      name: companyDomain,
      agree_privacy_policy: agreePrivacy,
      agree_terms_service: agreeTerms,
    }

    setLoading(true)
    dispatch(registration(body))
      .then((res) => {
        if (res.success) {
          navigation.replace('SignUpCode')
        }
      })
      .catch((err) => {
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
        Alert.alert(errorMsg)
      })
      .finally(() => {
        if (mounted()) setLoading(false)
      })
  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackClick)

    return () => backHandler.remove()
  }, [])

  const checkIfAgreed = (item) => {
    if (item === 'terms') {
      if (agreeTerms) {
        return true
      } else {
        return false
      }
    } else if (item === 'privacy') {
      if (agreePrivacy) {
        return true
      } else {
        return false
      }
    }
  }

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.NORMAL }}>
      <StatusBar barStyle={'light-content'} />
      <KeyboardAwareScrollView
        style={{ backgroundColor: colors.NORMAL }}
        contentContainerStyle={{ flex: 1 }}
      >
        <View style={[s.container]}>
          <CText style={[g.h1, { marginBottom: 60, textAlign: 'center' }]}>Sign Up</CText>
          <CInput
            spaces={false}
            maxLength={20}
            placeholder="Company Name"
            style={[s.input, { marginRight: 4 }]}
            value={companyDomain}
            setValue={setCompanyDomain}
            errorMessage={errorMessages?.domain}
          />

          <CInput
            maxLength={255}
            placeholder="Email"
            style={[s.input, { marginRight: 4 }]}
            value={email}
            setValue={setEmail}
            errorMessage={errorMessages?.email}
          />

          <TouchableOpacity style={[s.agreeTermsContainer]} onPress={() => toggleAgree('terms')}>
            {checkIfAgreed('terms') ? <CheckedIcon /> : <CheckedEmptyIcon />}
            <Text style={{ marginLeft: 10, fontWeight: '500', color: colors.WHITE }}>
              I agree to the{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('TermsOfService')}>
              <Text style={s.termsPolicyText}>Terms of Service</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* <TouchableOpacity style={[s.agreeTermsContainer]} onPress={() => toggleAgree('privacy')}>
            {checkIfAgreed('privacy') ? <CheckedIcon /> : <CheckedEmptyIcon />}
            <Text style={{ marginLeft: 10, fontWeight: '500', color: colors.WHITE }}>
              I agree to the{' '}
            </Text>
            <Text style={s.termsPolicyText}>Privacy Policy</Text>
          </TouchableOpacity> */}

          <CButton
            onPress={onSignUp}
            type={'white'}
            style={{ marginTop: 25, height: 50 }}
            loading={loading}
            setLoading={setLoading}
            loadingColor={colors.WHITE}
          >
            <CText style={[g.button, s.btnText]}>Sign Up</CText>
          </CButton>
          <CButton onPress={handleBackClick} type={'empty'} style={{ marginTop: 72, height: 50 }}>
            <CText style={[g.button]}>← Cancel</CText>
          </CButton>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  typeContainer: { padding: 60 },
  // mainContainer: { padding: 16, backgroundColor: colors.NORMAL },
  bg: {
    backgroundColor: colors.NORMAL,
    flex: 1,
  },
  btnText: { color: colors.WHITE },
  input: {
    maxHeight: 50,
    minHeight: 50,
  },
  termsText: {
    marginLeft: 8,
  },
  terms: {
    alignSelf: 'flex-start',
    marginBottom: 32,
  },
  container: {
    flex: 1,
    backgroundColor: colors.NORMAL,
    justifyContent: 'center',
    // width: '100%',
    border: '5px solid black',
    padding: 16,
  },
  backArea: {
    position: 'absolute',
    left: 0,
    width: 50,
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreeTermsContainer: {
    // paddingHorizontal: 16,
    // borderWidth: 1,
    height: 30,
    // borderWidth: 1,
    // borderBottomColor: colors.SEC_BG,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsPolicyText: {
    fontWeight: '500',
    color: colors.SECONDARY,
    borderBottomColor: colors.SECONDARY,
    borderBottomWidth: 0.7,
  },
  backIcon: {
    transform: [
      {
        rotate: '270deg',
      },
    ],
  },
})

export default SignUpEmail
