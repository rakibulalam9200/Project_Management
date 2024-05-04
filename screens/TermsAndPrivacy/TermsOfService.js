import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'

import { useDispatch } from 'react-redux'
import colors from '../../assets/constants/colors'
import CButtonInput from '../../components/common/CButtonInput'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import { setIsAgreeTerms } from '../../store/slices/auth'

const termsContents1 = [
  'A Terms and Conditions (T&C) agreement for your mobile app will help you maintain control over your app while limiting your legal liability.These agreements are also referred to as Terms of Use or Terms of Service agreements, but they all function in the same way.',
  'This article will detail what Terms and Conditions are, what benefits they provide for developers of mobile apps, what you should include in your own T&C, how to get your users to agree to your T&C and how to display your T&C within your mobile app.',
]

const termsContents2 = [
  "Put simply, a Terms and Conditions agreement is an agreement that's set out between a business and a customer that dictates how each party should behave. It dictates how your users can use your app by setting out rules that you intend for them to follow.",
  "There are numerous benefits to having concrete Terms and Conditions as a business, whether it's for your mobile app or website.",
  'It can improve trust between your business and your customers, protect your app from abuses, and help you limit your liability and risk.',
  "As an app developer, it's in your best interest to have Terms and Conditions set out in your app. Terms and Conditions aren't legally required by law, and you don't necessarily need one to launch a mobile app in an app store. But from both a legal and business perspective, it should be considered an essential step.",
]

const TermsOfService = ({ navigation,route }) => {
  const dispatch = useDispatch()
  const navFrom =  route.params ? route.params?.navFrom : null

  console.log(navFrom,'navFrom....')

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.START_BG }}>
      <StatusBar barStyle={'dark-content'} />
      <View
        style={[
          Platform.OS == 'ios' ?  navFrom === "payment" ? {marginBottom:48} : null : { paddingTop: 25 },
          { paddingHorizontal: 16, flex: 1 },
        ]}
      >
        <CHeaderWithBack
          title={'Terms of Service'}
          onPress={() => navigation.goBack()}
          containerStyle={{ marginTop: 0 }}
        />
        <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={s.header}>Terms and Conditions for VidaProjects sign up service</Text>
          {termsContents1.map((item, index) => {
            return (
              <Text key={index} style={[s.texts]}>
                {item}
              </Text>
            )
          })}
          <Text style={s.subHeader}>What are Terms and Conditions?</Text>
          {termsContents2.map((item, index) => {
            return (
              <Text key={index} style={[s.texts]}>
                {item}
              </Text>
            )
          })}
        </ScrollView>
        <View style={s.buttonContainer}>
          <CButtonInput
            label={'Decline'}
            onPress={() => {
              dispatch(setIsAgreeTerms(false))
              navigation.goBack()
            }}
            style={[s.buttons, { backgroundColor: colors.GREY, color: colors.WHITE }]}
          />
          <CButtonInput
            label={'Accept'}
            onPress={() => {
              dispatch(setIsAgreeTerms(true))
              navigation.goBack()
            }}
            style={[s.buttons, { backgroundColor: colors.HOVER, color: colors.WHITE }]}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  header: {
    color: colors.BLACK,
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 16,
  },
  subHeader: {
    color: colors.BLACK,
    fontWeight: 'bold',
    fontSize: 20,
    marginVertical: 16,
  },
  texts: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
    color: '#000E29',
    textAlign: 'justify',
    marginBottom: 5,
  },
  scrollView: {
    flex: 1,
  },
  buttons: {
    width: '49%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // gap:16,
    paddingVertical: 16,
  },
})

export default TermsOfService
