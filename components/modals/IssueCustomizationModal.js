import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useState } from 'react'
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import DragAndDrop from 'volkeno-react-native-drag-drop'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import GripIcon from '../../assets/svg/grip.svg'
import MinusBlueFillIcon from '../../assets/svg/minus.svg'
import PlusBlueFillIcon from '../../assets/svg/plus-blue-fill.svg'
import CButton from '../common/CButton'
import CText from '../common/CText'

const setItem = async (key, arr) => {
  await AsyncStorage.setItem(key, JSON.stringify(arr))
}

const IssueCustomizationModal = ({
  openModal,
  setOpenModal,
  expandView,
  setExpandView,
  itemView,
  setItemView,
  setCollapseView,
  collapseView,
}) => {
  const [isdraggable, setIsDraggable] = useState(false)
  const closeModal = () => {
    setOpenModal(false)
  }

  const CustomizationCard = ({ item, drag }) => {
    return (
      <TouchableOpacity style={styles.cardContainer}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity>
            <MinusBlueFillIcon />
          </TouchableOpacity>
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 18, lineHeight: 21 }}>{item?.label}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <GripIcon />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }
  const home = { iconName: 'HomeIcon', name: 'Home' }
  return (
    <Modal
      visible={openModal}
      animationType={'slide'}
      transparent={true}
      // style={{flex:1}}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.modal]}>
          <View style={[styles.modalContent]}>
            <View style={{ flex: 3 }}>
              <Text style={[g.body1, { marginTop: 20, marginBottom: 8 }]}>
                Customize list card view by adding or removing information.
              </Text>
              {
                <DragAndDrop
                  style={{ backgroundColor: 'none' }}
                  contentContainerStyle={{
                    backgroundColor: 'none',
                    flexDirection: 'column-reverse',
                  }}
                  itemKeyExtractor={(item) => item.id}
                  zoneKeyExtractor={(zone) => zone.id}
                  zones={collapseView}
                  items={itemView}
                  itemsContainerStyle={[
                    !itemView.length ? { paddingVertical: 32 } : { paddingVertical: 8 },
                  ]}
                  onMaj={(collapseView, itemView) => {
                    setCollapseView(collapseView)
                    setItemView(itemView)
                  }}
                  itemsInZoneStyle={[{ width: '100%', flex: 1 }]}
                  renderZone={(zone, children, hover) => {
                    zone.items.map((item) => {
                      if (!item.collapse) {
                        item.collapse = true
                      }
                    })
                    itemView.map((item) => {
                      if (item.collapse) {
                        item.collapse = false
                      }
                    })
                    return (
                      <View>
                        <Text style={[g.body2, { color: colors.NORMAL }]}>{zone.text}</Text>
                        {children}
                        <View
                          style={[
                            {
                              borderBottomWidth: 1,
                              borderBottomColor: '#D6E2FF',
                            },
                            !children?.props?.items?.length
                              ? { paddingVertical: 32 }
                              : { paddingTop: 8 },
                          ]}
                        ></View>
                      </View>
                    )
                  }}
                  renderItem={(item) => {
                    return (
                      <View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginVertical: 6,
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {item?.collapse ? <MinusBlueFillIcon /> : <PlusBlueFillIcon />}
                            <View style={{ marginLeft: 10 }}>
                              <Text style={{ fontSize: 18, lineHeight: 21 }}>{item?.label}</Text>
                            </View>
                          </View>

                          <View>
                            <GripIcon />
                          </View>
                        </View>
                      </View>
                    )
                  }}
                />
              }
            </View>

            <View
              style={[
                {
                  borderBottomWidth: 1,
                  borderBottomColor: '#D6E2FF',
                  marginBottom: 8,
                },
              ]}
            ></View>
            <Text style={[g.body2, { marginBottom: 4 }]}>Expand view:</Text>

            <GestureHandlerRootView style={{ flex: 2 }}>
              <DraggableFlatList
                data={expandView}
                renderItem={(props) => <CustomizationCard {...props} />}
                keyExtractor={(item, index) => index}
                onDragBegin={() => {}}
                onDragEnd={({ data }) => {}}
                containerStyle={{ flex: 1 }}
              />
            </GestureHandlerRootView>
            <View style={[styles.listItemContainer, { width: '100%', marginVertical: 10 }]}>
              <CButton
                type="gray"
                style={[styles.holdButton]}
                onPress={() => {
                  closeModal()
                }}
              >
                <CText style={g.title3}>Cancel</CText>
              </CButton>
              <CButton
                style={[styles.closeButton]}
                onPress={() => {
                  closeModal()
                  setItem('issueItemView', itemView)
                  setItem('issueCollapseView', collapseView)
                  //console.log(collapseView, 'collapse view...')
                }}
              >
                <CText style={g.title3}>Save</CText>
              </CButton>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    // height:'500'
  },
  modal: {
    // width: '100%',
    justifyContent: 'flex-end',
    flex: 1,
    backgroundColor: '#white',
    // backgroundColor: 'red',
    marginBottom: 56,
  },
  modalContent: {
    backgroundColor: '#F2F6FF',
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
    paddingTop: 8,
    flex: 1,
    // borderTopLeftRadius: 10,
    // borderTopRightRadius: 10,
    position: 'relative',
  },

  texts: {
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 18,
  },
  border: {
    borderColor: '#FFFFFF',
    borderTopWidth: 1,
  },
  modal2: {
    width: '100%',
    justifyContent: 'flex-end',
    height: '100%',

    flex: 1,
    backgroundColor: '#010714B8',
  },
  modalContent2: {
    backgroundColor: colors.WHITE,
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'relative',
    bottom: 56,
  },
  reOrderContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  topbar: {
    borderTopColor: colors.LIGHT_GRAY,
    borderTopWidth: 5,
    width: 32,
    alignSelf: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  cardContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    justifyContent: 'space-between',
    width: '100%',

    // flex: 1,
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
  margin1x: {
    marginVertical: 10,
  },
  margin2x: {
    marginVertical: 10,
  },
  holdButton: {
    backgroundColor: colors.HEADER_TEXT,
    width: '48%',
  },
  closeButton: {
    backgroundColor: colors.SECONDARY,
    width: '48%',
    marginLeft: 10,
  },
})

export default IssueCustomizationModal
