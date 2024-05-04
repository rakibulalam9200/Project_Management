import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import DeleteIcon from '../../assets/svg/delete-2.svg'

export default function CompanyCard({ company, onPress, onPressDelete }) {
  const {
    name = 'Microsoft',
    email = 'company@email.com',
    address_line_1 = '144-38 Melbourne Ave, Queens, NY',
    logo,
    status = 'active',
  } = company
  return (
    <TouchableWithoutFeedback onPress={onPress} style={[s.cardContainer]}>
      <View style={[g.containerLeft]}>
        <View>
          <Image source={{ uri: logo ? logo : null }} style={{ width: 72, height: 72 }} />
        </View>
        <View style={s.detailsContainer}>
          <Text style={s.companyName}>{name && name != 'null' ? name : '[Add Company Name]'}</Text>
          <Text style={s.companyEmail}>
            {email && email != 'null' ? email : '[Add Company Email]'}
          </Text>
          <View style={{width:'98%'}}>
            <Text style={s.companyAddress}>
              {address_line_1 && address_line_1 != 'null'
                ?  address_line_1
                : '[Add Company Address]'}
            </Text>
          </View>
        </View>
      </View>

      <View style={s.containerBetween}>
        <Text style={s.status}>{status}</Text>
        <View>
          <TouchableOpacity onPress={onPressDelete}>
            <DeleteIcon fill={colors.ICON_BG} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const s = StyleSheet.create({
  containerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderWidth: 1,
  },

  status: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.LIGHT_GRAY,
    color: colors.WHITE,
    alignSelf: 'flex-start',
    marginTop: 8,
    overflow: 'hidden',
    // marginLeft: 10,
  },

  cardContainer: {
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  detailsContainer: {
    padding: 8,
  },
  companyName: {
    fontFamily: 'inter-regular',
    color: colors.NORMAL,
    fontSize: 16,
    fontWeight: '700',
    // borderWidth: 1,
    width: '80%',
  },
  companyEmail: {
    fontFamily: 'inter-regular',
    color: colors.BLACK,
    fontSize: 16,
    // width: '95%',
    // paddingHorizontal: 10,
    // borderWidth: 1
  },
  companyAddress: {
    fontFamily: 'inter-regular',
    color: colors.BLACK,
    fontSize: 12,
    marginVertical: 8,
  },
})
