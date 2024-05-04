import React from 'react'
import {
    View,
    StyleSheet,
    Text,
    Modal,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CHeaderWithBack from '../common/CHeaderWithBack'
import CSelectWithLabel from '../common/CSelectWithLabel'
import IconWrap from '../common/IconWrap'
import ResetIcon from '../../assets/svg/reset.svg'
import CButtonInput from '../common/CButtonInput'
import ProjectPickerModal from './ProjectPickerModal'
import { useState } from 'react'
import UserPickerModal from './UserPickerModal'
import CDateTimePicker from '../common/CDateTimePicker'
import { useEffect } from 'react'
import CInputWithLabel from '../common/CInputWithLabel'
import MilestonePickerModal from './MilestonePickerModal'

import DotsIcon from '../../assets/svg/dots.svg'

const NotesConvertToTaskModal = ({
    visibility,
    setVisibility,
    setSelectedProject,
    selectedMilestone,
    setselectedMilestone,
    noteDescription,
    setSelectedDateTime,
    projectID
}) => {
    const [showProjectPicker, setShowProjectPicker] = useState(false)
    const [selected, setSelected] = useState({ id: -1, name: '' })
    const [showMilestonePickerModal, setShowMilestonePickerModal] = useState(false)
    const [showDatePickerModal, setShowDatePickerModal] = useState(false)
    const [users, setUsers] = useState([])
    const [showAdvanced, setShowAdvanced] = useState(false)
    const openProjectPickerModal = () => {
        setShowProjectPicker(true)
    }
    const openMilestonePickerModal = () => {
        setShowMilestonePickerModal(true)
    }

    const openDatePickerModal = () => {
        setShowDatePickerModal(true)
    }

    const closeModal = () => {
        setVisibility(false)
    }

    const applyFilters = () => {
        setSelectedProject(selected)
        // setselectedMilestone(users)
        closeModal()
    }
    const resetFilters = () => {
        setUsers([])
        setSelected({ id: -1 })
    }
    return (
        <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
            <SafeAreaView style={[g.outerContainer, g.padding2x]}>
                <ScrollView>
                    <ProjectPickerModal
                        visibility={showProjectPicker}
                        setVisibility={setShowProjectPicker}
                        selected={selected}
                        setSelected={setSelected}
                    />
                    <MilestonePickerModal
                        visibility={showMilestonePickerModal}
                        setVisibility={setShowMilestonePickerModal}
                        selected={selectedMilestone}
                        setSelected={setselectedMilestone}
                        projectId={projectID}
                    />
                    <CDateTimePicker
                        visible={showDatePickerModal}
                        setVisibility={setShowDatePickerModal}
                        setValue={setSelectedDateTime}
                    />
                    <CHeaderWithBack
                        onPress={closeModal}
                        title="Add New Task"
                        labelStyle={{ color: colors.HOME_TEXT, fontSize: 24 }}
                    />
                    <View style={[styles.selects]}>
                        <CInputWithLabel
                            label='Task Name'
                            placeholder='Name'
                            style={styles.inputBG}
                        />
                        <CSelectWithLabel
                            style={{ backgroundColor: colors.WHITE }}
                            label="Project"
                            onPress={openProjectPickerModal}
                            selectText={selected.id != -1 ? selected.name : 'Select'}
                            required
                        />
                        <CSelectWithLabel
                            label="Milestone"
                            style={{ backgroundColor: colors.WHITE }}
                            onPress={openMilestonePickerModal}
                        />
                        <CInputWithLabel
                            value={noteDescription}
                            style={styles.inputBG}
                        />
                        <TextInput
                            style={styles.descInputStyle}
                            spaces={false}
                            maxLength={255}
                            placeholder="Description"
                            multiline={true}
                            numberOfLines={15}
                            textAlignVertical="top"
                            placeholderTextColor={colors.HEADER_TEXT}
                            value={noteDescription}
                        //   onChangeText={setNoteDescription}
                        />
                        <View style={g.containerRight}>
                            <Text style={styles.inputHeader}>{showAdvanced ? 'Hide ' : 'More '} Options</Text>
                            <IconWrap
                                onPress={() => {
                                    setShowAdvanced((prev) => !prev)
                                }}
                                outputRange={iconWrapColors}
                            >
                                <DotsIcon fill={'dodgerblue'} />
                            </IconWrap>
                        </View>
                        <CSelectWithLabel
                            label="Date"
                            style={{ backgroundColor: colors.WHITE }}
                            onPress={openDatePickerModal}
                            showDate

                        />
                    </View>
                    <View style={[g.containerBetween, styles.resetContainer]}>
                        <TouchableOpacity style={[g.containerLeft]} onPress={resetFilters}>
                            <IconWrap outputRange={[colors.WHITE, colors.MID_BG, colors.END_BG]}>
                                <ResetIcon />
                            </IconWrap>
                            <Text style={styles.resetText}>Reset Filters</Text>
                        </TouchableOpacity>
                        <CButtonInput label="Apply Filter" onPress={applyFilters} />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    selects: {
        marginTop: 20,
    },
    resetText: {
        marginLeft: 10,
        color: colors.PRIM_CAPTION,
    },
    resetContainer: {
        marginTop: 90,
    },
    inputBG: {
        backgroundColor: colors.WHITE
    },
    inputHeader: {
        fontSize: 12,
        color: colors.HEADER_TEXT,
        marginRight: 12,
    },
    descInputStyle: {
        backgroundColor: colors.WHITE,
        color: colors.BLACK,
        padding: 12,
        borderRadius: 10,
        marginVertical: 12,
        fontSize: 16,
        fontWeight: '500',
    }
})


export default NotesConvertToTaskModal;
