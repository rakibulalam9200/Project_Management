import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CMidHeaderWithIcons from '../../components/common/CMidHeaderWithIcons'
import colors from '../../assets/constants/colors'
import { StatusBar } from 'expo-status-bar'
import MoreIcon from '../../assets/svg/more.svg'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import { useEffect, useState } from 'react'
import PriorityModal from '../../components/modals/PriorityModal'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import RadioSelectModal from '../../components/modals/RadioSelectModal'
import SelectButtonWithArrow from '../../components/common/SelectButtonWithArrow'
import { priorities } from '../../assets/constants/priority'
import CustomStatusBar from '../../components/common/CustomStatusBar'
import MultipleDocumentPicker from '../../components/common/MultipleDocumentPicker'
import CAttachments from '../../components/common/CAttachments'
import CButtonInput from '../../components/common/CButtonInput'
import api from '../../api/api'
import Toast from 'react-native-toast-message'
import { getMultipleAttachmentsFromDocuments } from '../../utils/Attachmets'
import withContainerKeyboardDismiss from '../../components/hoc/withContainerKeyboardDismiss'
import {
  useCreateSupportCaseMutation,
  useGetSupportCaseTypesQuery,
} from '../../store/slices/supportApi'
const SupportCaseAddOrEditScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    subject: '',
    priority: { id: null, name: '' },
    type: { id: null, name: '' },
    description: '',
    attachments: [],
  })
  const [documents, setDocuments] = useState([])
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])
  const [projectAttachments, setProjectAttachments] = useState([])
  const { subject, priority, type, description, attachments } = form
  const handleChanges = (name, value) => {
    setForm({ ...form, [name]: value })
  }
  const [errorMessages, setErrorMessages] = useState({
    name: '',
    subject: '',
    priority: '',
    type: '',
    description: '',
  })
  const { data: { data: caseTypes = [] } = {} } = useGetSupportCaseTypesQuery()
  const [createSupportCase, { isLoading: isCreating }] = useCreateSupportCaseMutation()
  const handleCreate = () => {
    setErrorMessages({ name: '', subject: '', priority: '', type: '', description: '' })
    Object.keys(form).forEach((key) => {
      if (form[key] === '' || form[key].id === null) {
        setErrorMessages((prev) => ({ ...prev, [key]: 'This field is required' }))
        return
      }
    })
    if (subject === '' || priority.id === null || type.id === null || description === '') {
      return
    }
    let attachments = getMultipleAttachmentsFromDocuments(documents)
    const payload = {
      subject,
      priority: priority.name.toLowerCase(),
      support_case_type_id: type.id,
      description,
      attachments,
    }
    handleCreateSupportCase(payload)
  }
  const handleCreateSupportCase = (payload) => {
    createSupportCase(payload)
      .unwrap()
      .then(() => {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Support case created successfully',
        })
        navigation.goBack()
      })
      .catch(() => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Error creating support case',
        })
      })
  }
  return (
    <>
      <CMidHeaderWithIcons onPress={() => navigation.goBack()} title={'New Case'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        shouldRasterizeIOS
      >
        <ScrollView
          style={{
            flex: 1,
          }}
        >
          <CInputWithLabel
            value={subject}
            setValue={(value) => {
              handleChanges('subject', value)
            }}
            placeholder="Subject"
            label="Subject"
            required
            showErrorMessage={errorMessages.subject !== ''}
            errorMessage={errorMessages.subject}
          />
          <RadioSelectModal
            selected={type}
            setSelected={(value) => handleChanges('type', value)}
            options={caseTypes}
          >
            <SelectButtonWithArrow
              label="Type"
              selectText={type.id != null ? capitalizeFirstLetter(type.name) : 'Select'}
              errorMessage={errorMessages.type}
              showErrorMessage={errorMessages.type !== ''}
              required
            />
          </RadioSelectModal>
          <RadioSelectModal
            selected={priority}
            setSelected={(value) => handleChanges('priority', value)}
            options={priorities}
          >
            <SelectButtonWithArrow
              label="Priority"
              selectText={priority.id != null ? capitalizeFirstLetter(priority.name) : 'Select'}
              errorMessage={errorMessages.priority}
              showErrorMessage={errorMessages.priority !== ''}
              required
            />
          </RadioSelectModal>
          <CInputWithLabel
            style={{
              height: 164,
              textAlignVertical: 'top',
            }}
            value={description}
            setValue={(value) => {
              handleChanges('description', value)
            }}
            multiline
            placeholder="Description"
            label="Description"
            required
            showErrorMessage={errorMessages.description !== ''}
            errorMessage={errorMessages.description}
          />
          <CAttachments
            attachments={projectAttachments}
            setAttachmentDeleteIndexes={setAttachmentDeleteIndexes}
            attachmentDeleteIndexes={attachmentDeleteIndexes}
          />
          <MultipleDocumentPicker documents={documents} setDocuments={setDocuments} />
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={[{ marginBottom: 16 }]}>
        <CButtonInput
          label="Create Case"
          onPress={handleCreate}
          loading={isCreating}
          disable={isCreating}
        />
      </View>
    </>
  )
}

export default withContainerKeyboardDismiss(SupportCaseAddOrEditScreen, 'New Case')
