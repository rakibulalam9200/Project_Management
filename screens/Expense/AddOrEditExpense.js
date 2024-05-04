import React, { useEffect, useState } from 'react'
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import g from '../../assets/styles/global'

import { useIsFocused } from '@react-navigation/native'
import { useRef } from 'react'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import CAttachments from '../../components/common/CAttachments'
import CButtonInput from '../../components/common/CButtonInput'
import CCheckbox from '../../components/common/CCheckbox'
import CDateTime from '../../components/common/CDateTime'
import CDocumentPicker from '../../components/common/CDocumentPicker'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import { setNormal } from '../../store/slices/tab'
import {
    getAttachmentsFromDocuments,
    getAttachmentsIdsFromDeleteIndexArrays,
} from '../../utils/Attachmets'
import { getErrorMessage, hasPriorityPickerErrors, hasProjectNameErrors } from '../../utils/Errors'
import { dateFormatter, getDateTime, getHourMinutes, jsCoreDateCreator, timeStampToDate } from '../../utils/Timer'
import moment from 'moment-mini'
import ProjectPickerModal from '../../components/modals/ProjectPickerModal'
import { useSelector } from 'react-redux'
import ExpenseCategoryPickerModal from '../../components/modals/ExpenseCategoryPickerModal'


export default function AddOrEditExpense({ navigation, route }) {

    const userInfo = useSelector((state) => state.user.user)
    let id = route.params ? route.params.id : null
    const isFocused = useIsFocused()
    const dispatch = useDispatch()
    const [expenseDate, setExpenseDate] = useState(null)
    const [documents, setDocuments] = useState([])

    const [errorMessages, setSErrorMessages] = useState({
        name: '',
    })
    const [attachments, setAttachments] = useState([])
    const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])

    const [showVendorPickerModal, setShowVendorPickerModal] = useState(false)
    const [selectedVendor, setSelectedVendor] = useState({ id: -1, name: '' })

    const [showCategoryPickerModal, setShowCategoryPickerModal] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState({ id: -1, name: '' })

    const [showProjectPickerModal, setShowProjectPickerModal] = useState(false)
    const [selectedProject, setSelectedProject] = useState({ id: -1, name: '' })

    const [expenseDescription, setExpenseDescription] = useState('')
    const [amount, setAmount] = useState(0.0)

    const scrollViewRef = useRef(null)

    const goBack = () => {
        navigation.goBack()
    }


    const addOrUpdateExpense = () => {
        let body = {
            expense_date: getDateTime(expenseDate),
            vendor_id: selectedVendor.id,
            category_id: selectedCategory.id,
            project_id: selectedProject.id,
            description: expenseDescription,
            amount: amount,
        }
        let attachments = getAttachmentsFromDocuments(documents)
        let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)
        body = { ...body, ...attachments, ...attachmentIds }
        //console.log('body', body)
    }

    useEffect(() => {
        if (isFocused) {
            dispatch(setNormal())
        }
    }, [isFocused])
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ExpenseCategoryPickerModal
                visibility={showCategoryPickerModal}
                setVisibility={setShowCategoryPickerModal}
                selected={selectedCategory}
                setSelected={setSelectedCategory}
            />
            <ScrollView style={[s.background]} ref={scrollViewRef}>
                <View style={[g.innerContainer]}>
                    <CHeaderWithBack
                        navigation={navigation}
                        title={id ? 'Update Expense' : 'Record Expense'}
                        onPress={goBack}
                    />
                    <ProjectPickerModal
                        visibility={showProjectPickerModal}
                        setVisibility={setShowProjectPickerModal}
                        selected={selectedProject}
                        setSelected={setSelectedProject}
                    />

                    <View style={s.gapVertical}>
                        <Text style={[s.labelStyle]}>Expense Date</Text>
                        <CDateTime
                            pickedDate={expenseDate}
                            setPickedDate={setExpenseDate}
                            style={{ width: '100%' }}
                            dateFormate

                        />

                        <CSelectWithLabel
                            label="Vendor"
                            onPress={() => setShowVendorPickerModal(true)}
                            selectText={selectedVendor.id != -1 ? selectedVendor.name : 'Select'}
                            errorMessage={errorMessages.vendor}
                            showErrorMessage
                            required
                        />
                        <CSelectWithLabel
                            label="Category"
                            onPress={() => setShowCategoryPickerModal(true)}
                            selectText={selectedCategory.id != -1 ? selectedCategory.name : 'Select'}
                            errorMessage={errorMessages.category}
                            showErrorMessage
                            required

                        />


                        <CInputWithLabel
                            label="Amount"
                            placeholder="$"
                            value={amount}
                            setValue={setAmount}
                            errorMessage={errorMessages.numberOfHours}
                            showErrorMessage
                            numeric
                            required
                        />


                        <TextInput
                            style={s.inputStyle}
                            spaces={false}
                            maxLength={255}
                            placeholder="Description"
                            multiline={true}
                            numberOfLines={6}
                            textAlignVertical="top"
                            placeholderTextColor={colors.HEADER_TEXT}
                            value={expenseDescription}
                            onChangeText={setExpenseDescription}
                        />

                        <CSelectWithLabel
                            label="Project"
                            onPress={() => setShowProjectPickerModal(true)}
                            selectText={selectedProject.id != -1 ? selectedProject.name : 'Select'}
                            errorMessage={errorMessages.project}
                            showErrorMessage
                            required
                        />

                    </View>
                    <View>

                        <CAttachments
                            attachments={attachments}
                            setAttachmentDeleteIndexes={setAttachmentDeleteIndexes}
                            attachmentDeleteIndexes={attachmentDeleteIndexes}
                        />
                        <CDocumentPicker documents={documents} setDocuments={setDocuments} />

                    </View>

                    <CButtonInput label="Save" onPress={addOrUpdateExpense} />

                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const s = StyleSheet.create({
    background: {
        backgroundColor: colors.WHITE,
        marginBottom: 60,
    },
    container: {
        marginTop: 24,
    },
    headerTitle: {
        marginLeft: 24,
    },
    inputHeader: {
        fontSize: 12,
        color: colors.HEADER_TEXT,
        marginRight: 12,
    },
    gapVertical: {
        marginVertical: 10,
    },
    inputStyle: {
        backgroundColor: colors.START_BG,
        color: colors.BLACK,
        padding: 12,
        borderRadius: 10,
        marginVertical: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    labelStyle: {
        fontSize: 12,
        color: colors.HEADER_TEXT,
        marginRight: 12,
        marginBottom: 4,
    },

})
