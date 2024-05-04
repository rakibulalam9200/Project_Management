import React, { useState } from 'react'
import { Alert, KeyboardAvoidingView, Modal, StyleSheet, Text, TextInput, View } from 'react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import { getErrorMessage } from '../../utils/Errors'
import CButton from '../common/CButton'
import CText from '../common/CText'

export default function CommentModal({
  children,
  visibility,
  setVisibility,
  model,
  modelId,
  setRefresh,
  setPage
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const commentOnActivity = async () => {
    if (comment === '') {
      Alert.alert("Comment can't be Empty!")
      return
    }
    setLoading(true)
    let body = {
      model_id: modelId,
      state: model,
      comment: comment,
    }

    api.activity
      .saveCommentActivity(body)
      .then((res) => {
        if (res.success) {
          setPage(1)
          //console.log(res, '#########################')
          // navigation.navigate(navigationName, { refetch: Math.random() })
        }
      })
      .catch((err) => {
        //console.log(err, 'error...........')
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
        closeModal()
        setComment('')
        setRefresh((pre) => !pre)
      })
  }

  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[s.modalOuterContainer]}>
        <KeyboardAvoidingView behavior="position" enabled style={{ marginHorizontal: 16 }}>
          <View style={s.modalContainer}>
            <Text
              style={[{ textAlign: 'center', color: '#000E29', paddingVertical: 8 }, g.titleText2]}
            >
              Comment
            </Text>
            <TextInput
              style={s.inputStyle}
              spaces={false}
              maxLength={2000}
              placeholder=""
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={colors.HEADER_TEXT}
              value={comment}
              onChangeText={setComment}
              height={100}
            />
            <View style={[s.listItemContainer, { width: '100%', marginVertical: 10 }]}>
              <CButton
                type="gray"
                style={[s.margin1x, s.grayButton]}
                onPress={() => {
                  setComment('')
                  closeModal()
                }}
              >
                <CText style={g.title3}>Cancel</CText>
              </CButton>
              <CButton
                style={[s.margin1x, s.blueButton]}
                onPress={commentOnActivity}
                // onPress={declineModule}
                loading={loading}
                loadingColor={colors.WHITE}
              >
                <CText style={g.title3}>Add Comment</CText>
              </CButton>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.5)',
  },
  modalContainer: {
    width: '100%',
    alignItems: 'stretch',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  headerContainerStyle: {
    marginVertical: 16,
  },
  headerLabel: {
    fontSize: 18,
    fontWeight: 'normal',
    marginLeft: 8,
  },
  settingsItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.WHITE,
    paddingVertical: 8,
  },
  settingsItemText: {
    fontFamily: 'inter-regular',
    color: colors.HOME_TEXT,
    fontSize: 18,
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
  grayButton: {
    backgroundColor: colors.HEADER_TEXT,
    width: '48%',
  },
  blueButton: {
    backgroundColor: colors.SECONDARY,
    width: '48%',
    marginLeft: 10,
  },
  inputStyle: {
    backgroundColor: colors.WHITE,
    color: colors.NORMAL,
    borderRadius: 10,
    marginVertical: 8,
    fontSize: 16,
    fontWeight: '500',
    padding: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
})
