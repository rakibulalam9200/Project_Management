import { View, StyleSheet, ActivityIndicator, BackHandler, Alert, Text } from 'react-native'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CText from '../../components/common/CText'
import CInput from '../../components/common/CInput'
import CButton from '../../components/common/CButton'
import EmailSentIcon from '../../assets/svg/email_sent.svg'

import LogoIcon from '../../assets/svg/logo_2.svg'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import {
    verifySignUpCode,
    decrementResendSignUpEmailTimer,
    resendVerifyEmail,
    verifyMFACode,
    logout,
} from '../../store/slices/auth'

import { useEffect } from 'react'
import { getTime } from '../../utils/Timer'
import { getErrorMessage, hasCodeErrors } from '../../utils/Errors'
import useIsMounted from '../../hooks/useIsMounted'
import CCodeInput from '../../components/common/CCodeInput'

const MFAVerification = ({ navigation }) => {
    const dispatch = useDispatch()
    const mounted = useIsMounted()
    const { loginEmail, resendSignUpEmailTimer } = useSelector((state) => state.auth)
    const [loading, setLoading] = useState(false)
    const [code, setCode] = useState('')
    const [errorMessages, setErrorMessages] = useState({
        code: '',
    })

    const handleCodeEntered = () => {
        if (hasCodeErrors(code, setErrorMessages)) return

        setLoading(true)
        dispatch(
            verifyMFACode({
                email: loginEmail,
                code: code,
            })
        )
            .then((res) => {
                // if (res.success) {
                //     navigation.navigate('SignUpNewPassword')
                // }
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

    const handleResendVerifyMail = () => {
        setLoading(true)
        dispatch(
            resendVerifyEmail({
                email: loginEmail,
                type: 'MFA'
            }, true)
        )
            .then((res) => {
                if (res.success) {
                    Alert.alert('Verification Code Successfully sent.')
                }
            })
            .catch((err) => {
                if (err.response) {
                    let errorMsg = getErrorMessage(err)
                    Alert.alert(errorMsg)
                } else {
                    //console.log(err)
                }
            })
            .finally(() => {
                if (mounted()) setLoading(false)
            })
    }


    const handleBackClick = async () => {
        //console.log('back clicked')
        await dispatch(logout())
        //console.log('logged out')
    }

    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(decrementResendSignUpEmailTimer())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    if (!loading) {
        return (
            <View style={[g.container, s.container]}>
                <LogoIcon />
                <Text style={s.subHeader}>Help run your business</Text>
                <CText style={s.infoText}>
                    To continue enter the 6-digit verification code sent to your phone number.
                </CText>

                <CCodeInput value={code} setValue={setCode} errorMessage={errorMessages.code} />

                <CButton onPress={handleCodeEntered} type={'white'}>
                    <CText style={[g.button, s.btnText]}>Verify Code</CText>
                </CButton>
                <Text></Text>
                {resendSignUpEmailTimer != 0 && (
                    <>
                        <CText style={{ marginTop: 28 }}>Didn't recieve a code?</CText>
                        <CText>You can request a new code within {getTime(resendSignUpEmailTimer)}</CText>
                    </>
                )}
                {resendSignUpEmailTimer == 0 && (
                    <Text
                        onPress={handleResendVerifyMail}
                        style={{ color: colors.SIGN_IN_BTN_BG, textDecorationLine: 'underline', marginTop: 10 }}
                    >
                        Resend Code
                    </Text>
                )}
                <CButton onPress={handleBackClick} type={'empty'} style={{ marginTop: 72 }}>
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
    subHeader: {
        color: colors.WHITE,
        marginVertical: 16,
        fontFamily: 'inter-regular',
        fontWeight: '500',
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
        marginTop: 32,
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

export default MFAVerification
