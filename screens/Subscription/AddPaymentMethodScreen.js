import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import colors from '../../assets/constants/colors';
import CHeaderWithBack from '../../components/common/CHeaderWithBack';
import Credit from '../../assets/svg/Credit.svg'
import Paypal from '../../assets/svg/paypal.svg'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import { useState } from 'react';
import CButtonInput from '../../components/common/CButtonInput';

const cards = [
  {
    id: 1,
    name: 'Credit/Debit Card',
    icon: <Credit />,
  },
  {
    id: 2,
    name: 'Paypal',
    icon: <Paypal />,
  },
]


const AddPaymentMethodScreen = ({ navigation, route }) => {

  const organizationId = route?.params?.organizationId
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const fromSubscriptionList = route?.params?.fromSubscriptionList ? true : false

  const goBack = () => {
    navigation.goBack();
  }


  // Payment option selection check
  const checkIfSelected = (paymentMethod) => {
    return selected.id == paymentMethod.id
  }

  const toggleSelected = (paymentMethod) => {
    if (paymentMethod.id == selected.id) setSelected({ id: -1 })
    else {
      setSelected(paymentMethod)
    }
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
          <Text style={s.cardText}>{card.name}</Text>
        </View>

        <View>{card.icon}</View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[s.container]}>
      <CHeaderWithBack
        onPress={goBack}
        title="Payment Details"
        labelStyle={s.headerLabel}
        iconWrapColors={iconWrapColors}
        containerStyle={s.headerContainerStyle}
      />
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 23, fontWeight: '700' }}>New Payment Method </Text>
        <Text style={{ fontSize: 16, fontWeight: '500', marginTop: 10, color: colors.PRIM_CAPTION }}>Choose your payment method</Text>
      </View>
      <View style={{ marginTop: 20 }}>
        {cards.map((card) => (
          <PaymentCard key={card.id} item={card} />
        ))}
      </View>

      <View style={{ marginTop: 10 }} >
        <CButtonInput label='Add New Payment Method' onPress={
          () => {
            if (selected.id == -1) {
              return Alert.alert('Please select a payment method')
            } else if (selected.id == 1) {
              navigation.navigate('Payment', { organizationId: organizationId, fromSubscriptionList: fromSubscriptionList })
            } else if (selected.id == 2) {
              return Alert.alert('Under Construction')
            }

          }} />
      </View>


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
    backgroundColor: colors.SEC_BG,
  },
  cardTextContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    marginLeft: 5,
    fontFamily: 'inter-medium',
    fontSize: 18,
  },
})

export default AddPaymentMethodScreen;
