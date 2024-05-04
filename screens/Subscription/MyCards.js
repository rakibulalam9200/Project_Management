import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import colors from '../../assets/constants/colors';
import CHeaderWithBack from '../../components/common/CHeaderWithBack';
import Credit from '../../assets/svg/Credit.svg'
import Paypal from '../../assets/svg/paypal.svg'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import { useState } from 'react';
import CButtonInput from '../../components/common/CButtonInput';
import api from '../../api/api';
import { useEffect } from 'react';
import VisaIcon from '../../assets/svg/visa.svg'
import DotIcon from '../../assets/svg/dots.svg'
import MasterCardIcon from '../../assets/svg/mastercard.svg'
import { useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux'
import { useRef } from 'react';
import PaymentCardSettingsModal from '../../components/modals/PaymentCardSettingsModal';
import { makeSubscribed, setSubscriptionNotNeededNewOrg } from '../../store/slices/subscription';
import PaymentAcceptedModal from '../../components/modals/PaymentAcceptedModal';

const MyCards = ({ navigation, route }) => {

    const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
    const [selected, setSelected] = useState({ id: -1, name: '' })
    const [paymentMethods, setPaymentMethods] = useState([])
    const [refetch, setRefetch] = useState(false)
    // let { domainIndex } = useSelector((state) => state.user)
    let subsId = useRef(route?.params?.subscriptionId)
    const organizationId = useRef(route?.params?.organizationId)
    const fromSettings = route?.params?.fromSettings ? route?.params?.fromSettings : false
    const fromLoginUnsubscribed = route?.params?.fromLoginUnsubscribed ? route?.params?.fromLoginUnsubscribed : false
    // const subsId = route?.params?.subscriptionId

    const isFocused = useIsFocused()
    const [loading, setLoading] = useState(false)
    const [paymentLoading, setPaymentLoading] = useState(false)
    const [openCardSettingsModal, setOpenCardSettingsModal] = useState(false)
    const [cardSettingsModalData, setCardSettingsModalData] = useState('')
    const { subscribed, subscriptionNeededNewOrg } = useSelector((state) => state.subscription)
    const dispatch = useDispatch()
    const [paymentAcceptedModal, setPaymentAcceptedModal] = useState(false)

    const goBack = () => {
        navigation.goBack();
    }

    // fetch the payment methods
    useEffect(() => {
        //console.log('fetching payment methods', organizationId.current, subsId.current)
        setLoading(true)
        api.subscription.getPaymentMethods(organizationId.current)
            .then(res => {
                setPaymentMethods(res.data)
                setSelected(res.data.find(item => item.is_default == true)) // set default payment method checked
                // //console.log(res.data)

            })
            .catch(err => {
                //console.log(err.response.data)
            })
            .finally(() => {
                setLoading(false)
            })

    }, [isFocused, refetch]);

    // Payment option selection check
    const checkIfSelected = (paymentMethod) => {
        // //console.log({ selected })
        return selected.id == paymentMethod.id
    }

    const toggleSelected = (paymentMethod) => {
        if (paymentMethod.id == selected.id) setSelected({ id: -1 })
        else {
            setSelected(paymentMethod)
        }
    }


    // Make Default
    const makeDefault = (paymentMethod) => {
        //console.log(paymentMethod)
        api.subscription.makeDefaultPaymentMethod({ organization_id: organizationId.current, payment_method: paymentMethod })
            .then(res => {
                //console.log(res)
                if (res.success) {
                    Alert.alert('Payment method set as default!')
                    setRefetch(!refetch)
                }
            })
            .catch(err => {
                //console.log(err.response.data)
            })


    }

    // go to subscription list
    const goToSubscriptionList = () => {
        setPaymentAcceptedModal(false)
        navigation.navigate('SubscriptionList')
        dispatch(setSubscriptionNotNeededNewOrg())
        dispatch(makeSubscribed(true))
    }

    // go to home
    const goToHome = () => {
        setPaymentAcceptedModal(false)
        dispatch(setSubscriptionNotNeededNewOrg())
        dispatch(makeSubscribed(true))
    }

    // Delete Payment Method
    const deletePaymentMethod = (paymentMethod) => {
        api.subscription.deletePaymentMethod({ organization_id: organizationId.current, payment_method: paymentMethod })
            .then(res => {
                //console.log(res)
                if (res.success) {
                    Alert.alert('Payment method deleted!')
                    setRefetch(!refetch)
                }
            })
            .catch(err => {
                //console.log(err.response.data)
            })

    }



    //Make payment
    const makePayment = () => {
        setPaymentLoading(true)
        //console.log(subsId.current)
        //console.log(organizationId.current, subsId.current)
        api.subscription.makeStripeSubscription({
            organization_id: organizationId.current,
            subscription_id: subsId.current,
            payment_method: selected.id
        })
            .then(res => {
                //console.log(res)
                if (res.success) {
                    // Alert.alert('You are subscribed to this plan!')
                    setPaymentAcceptedModal(true)
                    // navigation.navigate('SubscriptionList')

                }
            })
            .catch(err => {
                //console.log(err.response.data)
            })
            .finally(() => {
                setPaymentLoading(false)
            })
    }

    // Payment option card
    const PaymentCard = ({ item }) => {
        const card = item

        return (
            <TouchableOpacity
                style={[s.planContainer, checkIfSelected(card) ? s.planContainerSelected : null]}
                onPress={() => toggleSelected(card)}
            >
                <View style={s.cardTextContent}>
                    {checkIfSelected(card) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
                    <View style={[s.cardTypeView]}>
                        {
                            item.card.brand == 'visa' ? <VisaIcon /> : <MasterCardIcon />
                        }

                    </View>
                    <View style={{ marginLeft: 10 }}>
                        <Text style={s.cardText}>
                            {item.card.brand == 'visa' ? 'Visa' : 'MasterCard'} xxxx {item.card.last4}
                        </Text>
                        <Text style={{ color: colors.PRIM_CAPTION }}>Expires on {item.card.exp_month}/{item.card.exp_year}</Text>
                    </View>
                </View>

                <TouchableOpacity style={{ padding: 10, backgroundColor: colors.WHITE, borderRadius: 40 }}
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

    return (
        <View style={[s.container, { flex: 1 }]}>
            <PaymentAcceptedModal
                visibility={paymentAcceptedModal}
                setVisibility={setPaymentAcceptedModal}
                onPressOk={fromLoginUnsubscribed ? goToHome : goToSubscriptionList}
            />
            <PaymentCardSettingsModal
                visibility={openCardSettingsModal}
                setVisibility={setOpenCardSettingsModal}
                data={cardSettingsModalData}
                makeDefault={makeDefault}
                deleteCard={deletePaymentMethod}
                goToEditCard={() => {
                    navigation.navigate('EditPaymentMethod', { paymentMethodId: cardSettingsModalData, organizationId: organizationId.current })
                }}
            />
            <CHeaderWithBack
                onPress={goBack}
                title="Payment Details"
                labelStyle={s.headerLabel}
                iconWrapColors={iconWrapColors}
                containerStyle={s.headerContainerStyle}
            />
            <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 23, fontWeight: '700' }}>My Cards</Text>
                <Text style={{ fontSize: 16, fontWeight: '500', marginTop: 10, color: colors.PRIM_CAPTION }}>Default Card: </Text>
            </View>
            <ScrollView style={{ flex: 1, marginBottom: 50 }}>
                <View style={{ marginTop: 20 }}>
                    {
                        loading ?
                            <ActivityIndicator size="small" color={colors.PRIM_BODY} />
                            :
                            paymentMethods.length == 0 ?
                                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: colors.PRIM_BODY }}>No payment methods found for this organization!</Text>
                                </View>
                                :
                                paymentMethods.map((card) => (
                                    <PaymentCard key={card.id} item={card} />
                                ))
                    }
                </View>

                {paymentMethods.length > 0 && !fromSettings && <View style={{ marginTop: 10 }} >
                    <CButtonInput label={`${paymentLoading ? 'Please Wait..' : 'Make Payment'}`} onPress={
                        () => makePayment()
                    }
                        loading={paymentLoading}
                    />
                </View>}
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, backgroundColor: colors.SEC_BG, paddingVertical: 20, borderRadius: 10 }}

                    onPress={() => navigation.navigate('AddPaymentMethod', { organizationId: organizationId.current })}
                >
                    <View style={{ paddingVertical: 20, paddingHorizontal: 30, backgroundColor: colors.WHITE, marginLeft: 20, borderRadius: 5 }}></View>
                    <Text style={{ fontSize: 14, color: '#001D52', fontWeight: 'bold', marginLeft: 20 }}>Add Payment Method</Text>
                </TouchableOpacity>
            </ScrollView>


        </View>
    );
}

const s = StyleSheet.create({

    container: {
        padding: 24
    },

    headerContainerStyle: {
        marginVertical: 16,
    },
    headerLabel: {
        fontSize: 18,
        marginLeft: 8,
        textAlign: 'center',

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
        borderWidth: 2,
        borderColor: colors.HOVER,
        backgroundColor: colors.SEC_BG,
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
    }
})

export default MyCards;
