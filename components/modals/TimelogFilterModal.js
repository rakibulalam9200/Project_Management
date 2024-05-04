import React from 'react'
import {
    View,
    StyleSheet,
    Text,
    Modal,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
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
import MilestonePickerModal from './MilestonePickerModal'
import TaskPickerModal from './TaskPickerModal'
import CDateTime from '../common/CDateTime'

const TimelogFilterModal = ({
    showFilterModal,
    setShowFilterModal,
    setSelectedProject,
    selectedProject,
    selectedUsers,
    setSelectedUsers,
    selectedMilestone,
    setSelectedMilestone,
    selectedTask,
    setSelectedTask,
    selectedDate,
    setSelectedDate,
    setShowParentFilters,
}) => {

    const [showProjectPicker, setShowProjectPicker] = useState(false)
    const [showUserPickerModal, setShowUserPickerModal] = useState(false)
    const [showMilestonePickerModal, setShowMilestonePickerModal] = useState(false)
    const [showTaskPickerModal, setShowTaskPickerModal] = useState(false)

    const [project, setProject] = useState({ id: -1, name: '' })
    const [users, setUsers] = useState([])
    const [milestone, setMilestone] = useState({ id: -1, name: '' })
    const [task, setTask] = useState({ id: -1, name: '' })
    const [date, setDate] = useState(null)

    const openProjectPickerModal = () => {
        setShowProjectPicker(true)
    }
    const openUserPickerModal = () => {
        setShowUserPickerModal(true)
    }
    const closeModal = () => {
        setShowFilterModal(false)
    }

    const applyFilters = () => {
        setSelectedProject(project)
        setSelectedUsers(users)
        setSelectedMilestone(milestone)
        setSelectedTask(task)
        setSelectedDate(date)
        setShowParentFilters(true)
        closeModal()
    }
    const resetFilters = () => {
        setProject({ id: -1, name: '' })
        setUsers([])
        setMilestone({ id: -1, name: '' })
        setTask({ id: -1, name: '' })
        setDate(null)
        setSelectedProject({ id: -1, name: '' })
        setSelectedUsers([])
        setSelectedMilestone({ id: -1, name: '' })
        setSelectedTask({ id: -1, name: '' })
        setSelectedDate(null)
    }


    return (
        <Modal visible={showFilterModal} animationType="fade" onRequestClose={closeModal}>
            <SafeAreaView style={[g.outerContainer, g.padding2x, { marginTop: 0, paddingTop: 0 }]}>
                <ScrollView>
                    <ProjectPickerModal
                        visibility={showProjectPicker}
                        setVisibility={setShowProjectPicker}
                        selected={project}
                        setSelected={setProject}
                    />
                    <MilestonePickerModal
                        projectId={project.id}
                        visibility={showMilestonePickerModal}
                        setVisibility={setShowMilestonePickerModal}
                        selected={milestone}
                        setSelected={setMilestone}
                    />
                    <TaskPickerModal
                        projectId={project.id}
                        milestoneId={milestone.id}
                        visibility={showTaskPickerModal}
                        setVisibility={setShowTaskPickerModal}
                        selected={task}
                        setSelected={setTask}
                    />
                    <UserPickerModal
                        visibility={showUserPickerModal}
                        setVisibility={setShowUserPickerModal}
                        selected={users}
                        setSelected={setUsers}
                    />
                    <CHeaderWithBack
                        onPress={closeModal}
                        title="Timelogs Filter"
                    />
                    <View style={[styles.selects]}>
                        <CSelectWithLabel
                            style={{ backgroundColor: colors.WHITE }}
                            label="Project"
                            onPress={openProjectPickerModal}
                            selectText={project.id != -1 ? project.name : 'Select'}
                            required
                        />
                        <CSelectWithLabel
                            label="Milestone"
                            onPress={() => setShowMilestonePickerModal(true)}
                            selectText={milestone.id != -1 ? milestone.name : 'Select'}
                            style={{ backgroundColor: colors.WHITE }}
                            required
                        />
                        <CSelectWithLabel
                            label="Task or Issue"
                            onPress={() => setShowTaskPickerModal(true)}
                            selectText={task.id != -1 ? task.name : 'Select'}
                            style={{ backgroundColor: colors.WHITE }}
                            required
                        />
                        <CSelectWithLabel
                            label="Users"
                            style={{ backgroundColor: colors.WHITE }}
                            onPress={openUserPickerModal}
                        />
                        <CDateTime
                            pickedDate={date}
                            setPickedDate={setDate}
                            style={{ width: '100%', backgroundColor: colors.WHITE }}
                            label="Date"
                            showLabel
                            dateFormate
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
        marginTop: 15,
    },
})


export default TimelogFilterModal;
