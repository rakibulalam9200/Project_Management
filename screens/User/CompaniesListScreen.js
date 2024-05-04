import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import MoreIcon from '../../assets/svg/more.svg'
import CompanyCard from '../../components/cards/CompanyCard'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CMidHeaderWithIcons from '../../components/common/CMidHeaderWithIcons'
import CSearchInput from '../../components/common/CSearchInput'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import { setNormal } from '../../store/slices/tab'
import { getErrorMessage } from '../../utils/Errors'

export default function CompaniesListScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [search, setSearch] = useState('')
  const [refresh, setRefresh] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [query, setQuery] = useState('')
  const companyDeleteID = useRef(-1)
  let refetch = route.params ? route.params.refetch : null
  const goBack = () => {
    navigation.goBack()
  }

  const toggleRefresh = () => {
    setRefresh((prev) => !prev)
  }
  const onRefresh = () => {
    toggleRefresh()
  }

  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
      // dispatch(setPlusDestination('CompanyAdd'))
    }
  }, [isFocused])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  useEffect(() => {
    const body = {
      page: 1,
      pagination: 10,
    }
    if (query != '') {
      body['search'] = query
    }
    setLoading(true)
    api.company
      .getAllCompanies(body)
      .then((res) => {
      // console.log(res.data, 'company res')
        setCompanies(res.data)
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
      .finally(() => {
        setLoading(false)
      })
  }, [refresh, refetch, query])

  const handleDeleteCompany = () => {
    let id = companyDeleteID.current
    if (companies.length > 1) {
      api.company
        .deleteCompany(id)
        .then((res) => {
          if (res.success) {
            Alert.alert('Delete Successfully')
            toggleRefresh()
          }
        })
        .catch((err) => {
          console.log(err.response.data?.errors?.message[0],"------")
          
          let errorMsg = ''
          errorMsg = err.response.data?.errors?.message[0]
          // try {
          //   errorMsg = getErrorMessage(err?.response?.data)
          //   console.log(errorMsg,'error message')
          // } catch (err) {
          //   errorMsg = 'An error occured. Please try again later.'
          // }
          // console.log(errorMsg,"------------")
          Alert.alert(errorMsg)
        })
        .finally(() => {
          setShowDeleteModal(false)
        })
    } else {
      Alert.alert('You can not delete your only company.')
      setShowDeleteModal(false)
    }
  }

  return (
    <SafeAreaView
      style={[
        { flex: 1, backgroundColor: colors.CONTAINER_BG },
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <View style={[{ flex: 1, paddingHorizontal: 16 }]}>
        <DeleteConfirmationModal
          visibility={showDeleteModal}
          setVisibility={setShowDeleteModal}
          onDelete={handleDeleteCompany}
          confirmationMessage={
            'Are you sure you want to delete this company?. This action can not be undone.'
          }
        />
        <CMidHeaderWithIcons onPress={goBack} title="Companies" iconWrapColors={iconWrapColors}>
          <MoreIcon fill={colors.ICON_BG} />
        </CMidHeaderWithIcons>
        <CSearchInput
          placeholder="Search"
          value={search}
          setValue={setSearch}
          filterIcon={true}
          style={{ marginBottom: 8 }}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading && <ActivityIndicator size="large" color={colors.NORMAL} />}

          {!loading && (
            <View style={{ marginBottom: 60 }}>
              {companies && companies?.map((company) => {
                return (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    onPress={() => navigation.navigate('CompanyDetails', { id: company.id })}
                    onPressDelete={() => {
                      companyDeleteID.current = company.id
                      setShowDeleteModal(true)
                    }}
                  />
                )
              })}
            </View>
          )}
        </ScrollView>
        <CFloatingPlusIcon onPress={() => navigation.navigate('CompanyAdd')} />
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  filterContainer: {},
  userItemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
})
