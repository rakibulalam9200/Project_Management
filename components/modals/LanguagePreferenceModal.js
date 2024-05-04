import React, { useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import CHeaderWithBack from '../common/CHeaderWithBack'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import { language } from '../../assets/constants/languagePreference'

const LanguagePreferenceModal = ({
  openLanguageModal,
  setOpenLanguageModal,
  selectedLanguage,
  setSelectedLanguage,
}) => {
  const [languages, setLanguages] = useState([])

  const closeModal = () => {
    setOpenLanguageModal(false)
  }

  const toggleSelected = (language) => {
    setSelectedLanguage(language)
    // //console.log(language)
  }

  const checkIfSelected = (language) => {
    return selectedLanguage.language == language.language
    // //console.log(selectedLanguage)
  }

  useEffect(() => {
    setLanguages(language)
  }, [])

  return (
    <Modal visible={openLanguageModal} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={[{ flex: 1 }]}>
        <View style={{ paddingHorizontal: 16 }}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Select Language"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
            containerStyle={{ marginTop: 0 }}
          />
          <ScrollView>
            {languages.map((language) => {
              return (
                <TouchableOpacity
                  key={language.id}
                  style={[g.containerBetween, styles.modalInnerContainer]}
                  onPress={() => toggleSelected(language)}
                >
                  <Text>{language.language}</Text>
                  {checkIfSelected(language) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      </SafeAreaView>
      {/* <View>
        <Text>Hello</Text>
      </View> */}
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalInnerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
})

export default LanguagePreferenceModal
