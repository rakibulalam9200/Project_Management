import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { Path, Svg } from 'react-native-svg'
import Toast from 'react-native-toast-message'
import api from '../../api/api'
import g from '../../assets/styles/global'
import CButtonInput from '../../components/common/CButtonInput'
import CMidHeaderWithIcons from '../../components/common/CMidHeaderWithIcons'
import WithContainerKeyboardDismiss from '../../components/hoc/withContainerKeyboardDismiss'
import { useCloseSupportCaseMutation, useGetSupportCaseQuery } from '../../store/slices/supportApi'
import colors from '../../assets/constants/colors'

const SupportCasePage = ({ route, navigation }) => {
  const { uid, id } = route.params
  const [stack, setStack] = useState('details')
  const { data: { data: supportCase = {} } = {}, isLoading } = useGetSupportCaseQuery(id)
  const [closeSupportCase, { isLoading: isClosing }] = useCloseSupportCaseMutation()
  const {
    subject = 'subject',
    priority = 'low',
    type = 'type 1',
    attachments = [],
    user: { name = 'name', image = null } = {},
    description: { value: description = 'created_at' } = {},
    created_at,
    updated_at,
    assign_support_case_types = [],
    message = null,
    status = 'open',
  } = supportCase

  const breadcrumbs = [
    {
      title: 'Home',
      route: 'Home',
    },
    {
      title: 'My Account',
      route: 'Support',
    },
    {
      title: 'Support',
      route: 'SupportListScreen',
    },
    {
      title: uid,
      route: 'SupportCasePage',
    },
  ]

  const handleClose = () => {
    closeSupportCase(id)
      .unwrap()
      .then(() => {
        Toast.show({
          type: 'success',
          text1: 'Case Closed',
        })
        navigation.goBack()
      })
      .catch(() => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to close case',
        })
      })
  }
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="small" color={colors.HOVER} />
      </View>
    )
  }
  return (
    <>
      <CMidHeaderWithIcons onPress={() => navigation.goBack()} title={uid} />
      <ScrollView
        style={{
          flex: 1,
          paddingTop: 16,
        }}
      >
        <Text style={{ fontSize: 24, color: '#000E29', fontWeight: 700 }}>{subject}</Text>
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
          {breadcrumbs.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(item.route)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
              disabled={item.title === uid}
            >
              <Text style={{ fontSize: 14, color: '#9CA2AB', fontWeight: '500' }}>
                {item.title}
              </Text>
              {index !== breadcrumbs.length - 1 && (
                <Text style={{ fontSize: 14, color: '#9CA2AB', fontWeight: '500' }}>{' / '}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        <View style={[g.stackContainer, { marginTop: 31 }]}>
          <TouchableOpacity
            style={[g.stackButton, stack === 'details' ? g.stackButtonActive : null]}
            onPress={() => {
              setStack('details')
            }}
          >
            <Text style={[g.stackButtonText, stack === 'details' ? g.stackButtonTextActive : null]}>
              Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[g.stackButton, stack === 'resources' ? g.stackButtonActive : null]}
            onPress={() => {
              setStack('resources')
            }}
          >
            <Text
              style={[g.stackButtonText, stack === 'resources' ? g.stackButtonTextActive : null]}
            >
              Resources
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 32, flex: 1, gap: 16 }}>
          {stack === 'details' && (
            <>
              {/* author */}
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    borderRadius: 40,
                    backgroundColor: '#FFF',
                    color: '#246BFD',
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    marginBottom: 16,
                    width: 147,
                  }}
                >
                  {message ? 'Waiting for customer' : 'Waiting for support'}
                </Text>
                <Text
                  style={{ fontSize: 12, color: '#9CA2AB', fontWeight: '500', marginBottom: 4 }}
                >
                  Author:
                </Text>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 24.5,
                    padding: 1,
                    backgroundColor: '#FFF',
                  }}
                >
                  {image && (
                    <Image
                      source={{ uri: image }}
                      style={{ width: 48, height: 48, borderRadius: 24 }}
                    />
                  )}
                </View>
              </View>
              {/* date */}
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 16,
                  alignItems: 'center',
                  borderColor: '#FFF',
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  paddingVertical: 16,
                }}
              >
                <View
                  style={{
                    height: 48,
                    width: 48,
                    borderRadius: 24,
                    padding: 12,
                    backgroundColor: '#FFF',
                  }}
                >
                  <Svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <Path
                      d="M9 11H7V13H9V11ZM13 11H11V13H13V11ZM17 11H15V13H17V11ZM19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z"
                      fill="#246BFD"
                    />
                  </Svg>
                </View>
                <View style={{ marginRight: 39 }}>
                  <Text style={{ fontSize: 14, color: '#9CA2AB', fontWeight: '500' }}>
                    Date opened:
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: '#001D52', fontWeight: '500', marginTop: 10 }}
                  >
                    {new Date(created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 14, color: '#9CA2AB', fontWeight: '500' }}>
                    Edited date:
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: '#001D52', fontWeight: '500', marginTop: 10 }}
                  >
                    {new Date(updated_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              {/* status priority */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: { open: '#FFF', close: '#FFF', pending: '#FFF' }[status],
                    fontWeight: '500',
                    backgroundColor: { open: '#1DAF2B', close: 'grey', pending: '#FFD600' }[status],
                    textAlign: 'center',
                    paddingHorizontal: 10,
                    paddingVertical: 2,
                    borderRadius: 40,
                    textTransform: 'capitalize',
                  }}
                >
                  {status}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#1DAF2B',
                    fontWeight: '500',
                    backgroundColor: '#FFF',
                    textAlign: 'center',
                    paddingHorizontal: 10,
                    paddingVertical: 2,
                    borderRadius: 40,
                    textTransform: 'capitalize',
                  }}
                >
                  {priority}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 16,
                  color: '#001D52',
                  fontWeight: '500',
                }}
              >
                {description}
              </Text>
            </>
          )}

          {stack === 'resources' && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6' }}
                >
                  <Image
                    source={{ uri: image }}
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                  />
                </View>
                <Text style={{ fontSize: 14, color: '#000E29', fontWeight: '700', marginLeft: 8 }}>
                  {name}
                </Text>
              </View>
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 14, color: '#000E29', fontWeight: '500' }}>
                  Description
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#000E29',
                    fontWeight: '400',
                    marginTop: 8,
                    lineHeight: 20,
                  }}
                >
                  {description}
                </Text>
              </View>
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 14, color: '#000E29', fontWeight: '500' }}>
                  Attachments
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                  {attachments.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        width: 60,
                        height: 60,
                        backgroundColor: '#F3F4F6',
                        borderRadius: 8,
                        marginRight: 8,
                        marginBottom: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 14, color: '#000E29', fontWeight: '500' }}>
                        {item.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <View style={[{ marginBottom: 16 }]}>
        <CButtonInput
          disable={status === 'close' || isClosing}
          label={status === 'close' ? 'Case Closed' : 'Close Case'}
          onPress={handleClose}
          loading={isClosing}
          style={{
            backgroundColor: { close: 'grey' }[status] || '#E9203B',
            color: '#FFF',
          }}
        />
      </View>
    </>
  )
}

export default WithContainerKeyboardDismiss(SupportCasePage, { bgColor: '#F3F4F6' })
