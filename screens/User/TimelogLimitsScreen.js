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
import RightAngularIcon from '../../assets/svg/arrow-right-blue.svg'
import api from '../../api/api'

import CInputWithLabel from '../../components/common/CInputWithLabel'
import ToggleSwitch from 'toggle-switch-react-native'

const TimelogLimitsScreen = ({ navigation }) => {
  const [ipAddress, setIPAddress] = useState('')
  const [subnetMask, setSubnetMask] = useState('')
  const [enableApprove, setEnableApprove] = useState(false)

  const goBack = () => {
    navigation.goBack()
  }

  const handleSave = () => {}

  const checkIfEnabled = (value) => {
    if (value) {
      return true
    } else {
      return false
    }
  }

  return (
    <SafeAreaView
      style={[
        g.safeAreaStyle,
        styles.container,
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <View style={{ paddingHorizontal: 16 }}>
        <CHeaderWithBack
          title="Time logs limits"
          onPress={goBack}
          containerStyle={{ marginTop: 0 }}
        />
      </View>
      <ScrollView contentContainerStyle={{ flex: 1, marginBottom: 60, paddingHorizontal: 16 }}>
        <View style={{ justifyContent: 'space-between', flex: 1 }}>
          <View>
            <CInputWithLabel
              placeholder={'_ _'}
              style={styles.input}
              value={ipAddress}
              setValue={setIPAddress}
              label="Max working hours per week"
            />

            <CInputWithLabel
              placeholder={'_ _'}
              style={styles.input}
              value={subnetMask}
              setValue={setSubnetMask}
              label="Max working hours per day"
            />

            <View style={styles.approveContainer}>
              <Text style={{ marginVertical: 8, fontSize: 16, fontWeight: '700' }}>
                Auto approve:
              </Text>
              <View
                style={{ marginVertical: 8, flexDirection: 'row', gap: 10, alignItems: 'center' }}
              >
                <ToggleSwitch
                  isOn={checkIfEnabled(enableApprove)}
                  onColor="green"
                  offColor={colors.SEC_BG}
                  labelStyle={{ color: 'black', fontWeight: '900' }}
                  size="medium"
                  onToggle={(isOn) => setEnableApprove(isOn)}
                  animationSpeed={150}
                />
                <Text style={{ fontSize: 16 }}>{enableApprove ? 'Enable' : 'Disable'}</Text>
              </View>

              <View style={[styles.agreeTermsContainer]}>
                <Text
                  style={[
                    { fontSize: 16, fontWeight: '400' },
                    enableApprove ? { color: colors.BLACK } : { color: colors.LIGHT_GRAY },
                  ]}
                >
                  Auto-approve after
                </Text>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => {}}
                >
                  <Text
                    style={[
                      { marginLeft: 10, fontSize: 16, fontWeight: '400', marginRight: 10 },
                      enableApprove ? { color: colors.HOVER } : { color: colors.LIGHT_GRAY },
                    ]}
                  >
                    7
                  </Text>
                  <RightAngularIcon
                    style={{ marginTop: 0 }}
                    fill={enableApprove ? '#246BFD' : '#9CA2AB'}
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    { marginLeft: 10, fontSize: 16 },
                    enableApprove ? { color: colors.BLACK } : { color: colors.LIGHT_GRAY },
                  ]}
                >
                  days from submission
                </Text>
              </View>
            </View>
          </View>
          <View style={{}}>
            <CButtonInput style={[g.button, styles.btnText]} label="Save" onPress={handleSave} />
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

  agreeTermsContainer: {
    // paddingHorizontal: 16,
    // borderWidth: 1,
    backgroundColor: colors.WHITE,
    height: 30,
    // borderWidth: 1,
    // borderBottomColor: colors.SEC_BG,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
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

  btnText: {
    color: colors.WHITE,
    // height: 50,
    paddingVertical: 12,
  },

  approveContainer: {
    marginTop: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.SEC_BG,
  },
})

export default TimelogLimitsScreen
