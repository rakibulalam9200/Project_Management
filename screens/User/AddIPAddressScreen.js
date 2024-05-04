import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native'

import { SafeAreaView } from 'react-native'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CButtonInput from '../../components/common/CButtonInput'

import api from '../../api/api'

import CInputWithLabel from '../../components/common/CInputWithLabel'

const AddIPAddressScreen = ({ navigation }) => {
  const [ipAddress, setIPAddress] = useState('')
  const [subnetMask, setSubnetMask] = useState('')
  const [saveDisabled, setSaveDisabled] = useState(true)

  const goBack = () => {
    navigation.goBack()
  }

  const handleSave = () => {}

  useEffect(() => {
    if (ipAddress.length > 0 && subnetMask.length > 0) {
      setSaveDisabled(false)
    } else {
      setSaveDisabled(true)
    }
  }, [ipAddress, subnetMask])

  return (
    <SafeAreaView
      style={[
        g.safeAreaStyle,
        styles.container,
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <View style={{ marginHorizontal: 16 }}>
        <CHeaderWithBack
          title="Add IP Address"
          onPress={goBack}
          containerStyle={{ marginTop: 0 }}
        />
      </View>
      <ScrollView contentContainerStyle={{ flex: 1, marginBottom: 60, paddingHorizontal: 16 }}>
        <View style={{ justifyContent: 'space-between', flex: 1 }}>
          <View>
            <CInputWithLabel
              placeholder={'0.0.0.0'}
              style={styles.input}
              value={ipAddress}
              setValue={setIPAddress}
              label="Allowed IP Address"
            />

            <CInputWithLabel
              placeholder={'255.255.0.0'}
              style={styles.input}
              value={subnetMask}
              setValue={setSubnetMask}
              label="Subnet Mask"
            />
          </View>
          <View style={[styles.formContainer]}>
            <CButtonInput
              style={[g.button, saveDisabled ? styles.disabledButton : styles.btnText]}
              textStyle={saveDisabled ? { color: colors.GREY } : {}}
              label="Save"
              onPress={handleSave}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
  },

  buttonText: {
    color: colors.WHITE,
    fontWeight: 'bold',
    fontSize: 18,
  },

  input: {
    // backgroundColor: colors.PRIM_BG,
    color: colors.INPUT_BG,
    // maxHeight: 64,
    // minHeight: 48,
    // borderWidth: 1
    maxHeight: 50,
    // minHeight: 50,
  },

  formContainer: {
    // marginHorizontal: 16,
    // borderWidth: 1
  },
  btnText: {
    color: colors.WHITE,
    // height: 50,
    paddingVertical: 12,
  },

  disabledButton: {
    backgroundColor: colors.COLUMN,
    color: colors.BLACK,
  },
})

export default AddIPAddressScreen
