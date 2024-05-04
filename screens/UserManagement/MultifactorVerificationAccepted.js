import React, { useState } from 'react'
import { View, StyleSheet, Text, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native'
import colors from '../../assets/constants/colors'
import api from '../../api/api'
import { getErrorMessage } from '../../utils/Errors'
import CheckICon from '../../assets/svg/checkwhite.svg'
const MultifactorVerificationAccepted = ({ navigation, route }) => {
    const [errorMessage, setErrorMessage] = useState({
        code: '',
    })

    // Update user settings
    const updateUserSettings = () => {
        const body = {
            is_multi_authorization: true,
        }

        api.user.changeUserSettings(body)
            .then(res => {
                //console.log(res)
                if (res.success) {
                    //console.log('Success')
                    navigation.navigate('Security')
                }
            })
            .catch(err => {
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
            <ScrollView>

                <View style={[styles.form]}>
                    <View style={[styles.CheckICon]}>
                        <CheckICon />
                    </View>
                    <Text style={[styles.heading]}>Accepted </Text>
                    <Text style={[styles.subHeading]}>Multifactor authentication verification
                        is now enabled on your Account</Text>
                    <TouchableOpacity
                        onPress={updateUserSettings}
                        style={[styles.button]}
                    >
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.WHITE }}>OK</Text>
                    </TouchableOpacity>

                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(1, 7, 20, 0.72)',
        flex: 1,
        paddingVertical: 151,
    },

    form: {
        marginHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        paddingHorizontal: 30,
        paddingVertical: 40,
        borderRadius: 20,
    },
    CheckICon: {
        backgroundColor: '#1DAF2B',
        padding: 20,
        borderRadius: 100,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 15,
    },
    subHeading: {

        fontSize: 16,
        marginVertical: 15,
        textAlign: 'center',
    },
    button: {
        backgroundColor: colors.SECONDARY,
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },

})

export default MultifactorVerificationAccepted
