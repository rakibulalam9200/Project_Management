import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '../../assets/constants/colors'

import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'

import BackArrow from '../../assets/svg/arrow-left.svg'

import RightArrowIcon from '../../assets/svg/arrow-right-blue.svg'
import SettingsIcon from '../../assets/svg/settings.svg'

import { useIsFocused } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import g from '../../assets/styles/global'
import CButton from '../../components/common/CButton'
import { setNormal, setShowFileUploadModal } from '../../store/slices/tab'

export default function BudgetDetailsScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  let id = route.params ? route.params.id : null
  const { currentProject } = useSelector((state) => state.navigation)

  let refetch = route.params ? route.params?.refetch : null
  const [projectDetails, setProjectDetails] = useState({})
  const [status, setStatus] = useState(projectDetails && projectDetails.stage)
  const isFocused = useIsFocused()
  const dispatch = useDispatch()

  useEffect(() => {
    //console.log(refetch)
    const getProjectDetails = async () => {
      if (!currentProject) return
      api.project
        .getProject(currentProject.id)
        .then((res) => {
          if (res.success) {
            setProjectDetails(res.project)
            setStatus(res.project.stage)
            //console.log(JSON.stringify(res.project))
          }
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
    }

    getProjectDetails()
  }, [refetch, status, isFocused])

  const updateProjectStatus = async (status) => {
    let body = {
      stage: status,
    }
    if (!currentProject) return
    api.project
      .changeStatus(body, currentProject.id)
      .then((res) => {
        if (res.success) {
          setStatus(status)
          Alert.alert(res.message)
        }
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
  }

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  const naviGateToFileScreenAndOpenAddFileModal = () => {
    navigation.navigate('ProjectFiles', {
      projectName: projectDetails.name,
      fromProject: true,
      hidePlus: true,
    })
    dispatch(setShowFileUploadModal())
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={[s.outerContainer]}>
          <View style={s.headerContainer}>
            <IconWrap
              onPress={() => {
                //console.log(refetch)
                navigation.navigate('Projects', refetch ? { refetch } : {})
              }}
              outputRange={iconWrapColors}
            >
              <BackArrow fill={colors.NORMAL} />
            </IconWrap>
            <View style={s.buttonGroup}>
              <IconWrap onPress={() => {}} outputRange={iconWrapColors} style={s.buttonGroupBtn}>
                <SettingsIcon fill={colors.NORMAL} />
              </IconWrap>
            </View>
          </View>
          <View style={s.headerContainer}>
            <CText style={[g.body1, { color: '#000E29' }]}>
              Project: <Text style={{ color: '#246BFD' }}>{'ProjectName1'}</Text>
            </CText>
          </View>
          <View style={{ marginBottom: 12 }}>
            <Text style={[g.gCardStatus, status && { backgroundColor: '#9CA2AB' }]}>{'Draft'}</Text>
          </View>
          <View style={s.budgetContainer}>
            <View style={s.budgetView}>
              <Text style={[g.body1, { color: '#000E29' }]}>{'Summary'}</Text>
              <Text style={[g.title3, { color: '#E9203B' }]}>{'$80 000'}</Text>
            </View>
            <View style={s.budgetView}>
              <Text style={[g.body1, { color: '#000E29' }]}>{'Planned'}</Text>
              <Text style={[g.title3, { color: '#1DAF2B' }]}>{'$80 000'}</Text>
            </View>
            <View style={s.budgetView}>
              <Text style={[g.body1, { color: '#000E29' }]}>{'Variance'}</Text>
              <Text style={[g.title3, { color: '#246BFD' }]}>{'$0'}</Text>
            </View>
          </View>

          <View style={s.listItemContainer}>
            <TouchableOpacity
              style={s.listItemTitle}
              onPress={() => {
                navigation.navigate('BudgetItems')
              }}
            >
              <CText style={[g.title1, s.listItemTitleText]}>
                Budget items <CText style={s.listItemSubTitle}>{`(30)`}</CText>
              </CText>
              <RightArrowIcon fill={colors.ICON_BG} />
            </TouchableOpacity>
          </View>
          <View style={s.listItemContainer}>
            <TouchableOpacity style={s.listItemTitle} onPress={() => {}}>
              <CText style={[g.title1, s.listItemTitleText]}>
                Expenses <CText style={s.listItemSubTitle}>{`(0)`}</CText>
              </CText>
              <RightArrowIcon fill={colors.ICON_BG} />
            </TouchableOpacity>
          </View>
          <View style={s.listItemContainer}>
            <TouchableOpacity style={s.listItemTitle} onPress={() => {}}>
              <CText style={[g.title1, s.listItemTitleText]}>
                Chat <CText style={s.listItemSubTitle}>{`(8)`}</CText>
              </CText>
              <RightArrowIcon fill={colors.ICON_BG} />
            </TouchableOpacity>
          </View>

          <View style={[s.listItemContainer, { width: '100%' }]}>
            <CButton style={[s.margin1x, s.closeButton]} onPress={() => {}}>
              <CText style={g.title3}>For Approval</CText>
            </CButton>
          </View>
          <View style={s.divider}></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingTop: 20,
    backgroundColor: 'yellow',
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 23,
    paddingTop: 4,
  },
  outerContainer: {
    paddingTop: StatusBar.currentHeight,
    paddingHorizontal: 24,
    backgroundColor: colors.PRIM_BG,
    flex: 1,
    alignItems: 'flex-start',
    marginBottom: 60,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },
  titleText: {
    fontSize: 30,
    color: 'black',
  },
  smallText: {
    fontSize: 12,
    color: 'gray',
  },
  overLapIcon: {
    position: 'relative',
    left: -24,
  },
  overLapIcon2: {
    position: 'relative',
    left: -48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarText: {
    color: 'dodgerblue',
  },
  calendarText: {
    color: 'black',
    marginLeft: 5,
  },
  descriptionText: {
    color: '#001D52',
    fontSize: 16,
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 20,
    backgroundColor: '#9CA2AB',
    //   backgroundColor: 'rgb(45, 156, 219)',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
  },
  cardProgressText: {
    marginLeft: 10,
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  listItemTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    flex: 1,
  },
  listItemTitleText: {
    fontSize: 24,
    color: 'black',
  },
  listItemIcon: {
    marginLeft: 10,
  },
  listItemSubTitle: {
    color: 'gray',
  },
  divider: {
    marginTop: 40,
  },
  margin1x: {
    marginVertical: 10,
  },
  holdButton: {
    backgroundColor: colors.HEADER_TEXT,
    width: '50%',
    marginLeft: 10,
  },
  closeButton: {
    backgroundColor: colors.SECONDARY,
    width: '100%',
  },
  budgetContainer: {
    // flex:1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    width: '100%',
  },
  budgetView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 105,
  },
})
