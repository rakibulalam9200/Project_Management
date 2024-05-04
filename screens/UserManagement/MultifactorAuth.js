import React from 'react'
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
} from 'react-native'
import colors from '../../assets/constants/colors'
import CButton from '../../components/common/CButton'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CText from '../../components/common/CText'
import g from '../../assets/styles/global'
import { useState } from 'react'
import api from '../../api/api'
import CButtonInput from '../../components/common/CButtonInput'
import { getErrorMessage } from '../../utils/Errors'
import { useEffect } from 'react'

const MultifactorAuth = ({ navigation, route }) => {
  const [phone, setPhone] = useState('')

  const handleSend = () => {
    //console.log('Pressed')

    api.user
      .sendSMSVerificationCode({ phone })
      .then((res) => {
        //console.log(res)
        if (res.success) {
          navigation.push('MultifactorVerifyCode', { phone })
          // //console.log('Success')
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })
  }

  return (
    <SafeAreaView style={[styles.container]}>
      <KeyboardAvoidingView
        behavior="padding"
        enabled={Platform.OS == 'ios'}
        keyboardVerticalOffset={100}
        style={styles.innerContainer}
      >
        <ScrollView>
          <View>
            <Text style={[styles.heading]}>Multifactor authentication verification</Text>
          </View>

          <View style={[styles.subHeadingContainer]}>
            <Text style={[styles.subHeading]}>
              Please, enter your phone number, to enable Multifactor authentication
            </Text>
          </View>
          <View style={[styles.form]}>
            <CInputWithLabel placeholder="" style={styles.input} label="" setValue={setPhone} />
          </View>
          <View style={[styles.button]}>
            <CButtonInput label="Continue" onPress={handleSend} />
          </View>
          <View style={[styles.button]}>
            <CButtonInput label="Go Back" onPress={() => navigation.goBack()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(1, 7, 20, 0.72)',
    flex: 1,
  },
  innerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 50,
    color: colors.WHITE,
    marginTop: 60,
  },
  subHeadingContainer: {
    marginTop: 60,
    marginHorizontal: 24,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: colors.WHITE,
  },
  form: {
    marginHorizontal: 24,
  },
  button: {
    marginHorizontal: 24,
    marginTop: 20,
  },
  btnText: {
    color: colors.WHITE,
  },
  input: {
    backgroundColor: '#D6E2FF',
    maxHeight: 50,
  },
})

export default MultifactorAuth
