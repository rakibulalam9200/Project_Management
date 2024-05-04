import React, { useEffect, useState } from 'react'
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CButtonInput from '../../components/common/CButtonInput'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import { CardField, createPaymentMethod, } from '@stripe/stripe-react-native'
import { useSelector } from 'react-redux'
import api from '../../api/api'

const AddCardScreen = ({ navigation, route }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [cardHolderName, setCardHolderName] = useState('')
  const [cardDetails, setCardDetails] = useState({})
  let { domainIndex } = useSelector((state) => state.user)

  useEffect(() => { }, [])

  const addCard = async () => {
    const billingDetails = {
      name: 'John Doe',
      email: 'johndoe@example.com',
    };
    const { paymentMethod, error } = await createPaymentMethod({
      type: 'Card',
      billingDetails,

    })
    if (error) {
      // Alert.alert(pm.error.message)
      return
    }
    else {
      //console.log(paymentMethod)
    }

    // try {
    //   let pm_id = pm.paymentMethod.id
    //   //console.log(pm_id)
    //   //console.log(domainIndex)
    //   let res = await api.subscription.attachCard(
    //     {
    //       payment_method: pm_id,
    //     },
    //     domainIndex
    //   )
    //   if (res.success) {
    //     navigation.navigate('Payment', { refetch: Math.random() })
    //   }
    // } 
    // catch (err) {
    //   let errorMsg = ''
    //   try {
    //     errorMsg = getErrorMessage(err)
    //   } catch (err) {
    //     errorMsg = 'An error occured. Please try again later.'
    //   }
    //   Alert.alert(errorMsg)
    // }
  }


  return (
    <SafeAreaView style={s.containerBG}>
      <View style={[g.outerContainer, s.outerPadding]}>

        <CInputWithLabel
          label="Name"
          value={cardHolderName}
          setValue={setCardHolderName}
          style={s.inputStyle}
        />

        <CardField
          style={s.cardField}
          postalCodeEnabled={false}
          onCardChange={(cardDetails) => setCardDetails(cardDetails)}
        />



        <CButtonInput label="Add" onPress={addCard} />
      </View>
    </SafeAreaView>
  )
}

export default AddCardScreen

const s = StyleSheet.create({
  containerBG: {
    flex: 1,
    backgroundColor: colors.CONTAINER_BG,
  },
  inputStyle: {
    backgroundColor: colors.WHITE,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 16,
  },
})
