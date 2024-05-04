import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import CHeaderWithBack from '../common/CHeaderWithBack'

import CloneIcon from '../../assets/svg/clone.svg'
import CreateTemplateIcon from '../../assets/svg/create-template.svg'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import FileIcon from '../../assets/svg/File.svg'
import SettingIcon from '../../assets/svg/settings.svg'
import CButtonInput from '../common/CButtonInput'
import IconWrap from '../common/IconWrap'
import AllCollapseIcon from '../../assets/svg/all-collapse.svg'
import MoveIcon from '../../assets/svg/move.svg'
import TaskIcon from '../../assets/svg/taskstack.svg'
import ExpandIcon from '../../assets/svg/all-expand-icon.svg'

export default function CalendarSettingsModal({
    children,
    groupBy,
    setGroupBy,
    collapsed,
    setCollapsed,
    visibility,
    setVisibility,
    navigation,
    onDelete = null,
    onClone = null,
    onFilter = null,
}) {
    const closeModal = () => {
        setVisibility(false)
    }
    const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
    return (
        <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
            <View style={[s.modalOuterContainer]}>
                <View style={s.modalContainer}>
                    <CHeaderWithBack
                        onPress={closeModal}
                        title="Settings"
                        labelStyle={s.headerLabel}
                        // iconWrapColors={iconWrapColors}
                        containerStyle={s.headerContainerStyle}
                    />
                    <TouchableOpacity style={[s.settingsItemContainer]} onPress={() => {
                        setGroupBy(!groupBy)
                        closeModal()
                    }}>
                        <Text style={s.settingsItemText}>{groupBy ? 'Show just tasks' : 'Group by project'}</Text>
                        <IconWrap outputRange={iconWrapColors}>
                            {groupBy ? <TaskIcon /> : <FileIcon />}
                        </IconWrap>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[s.settingsItemContainer]}
                        onPress={() => {
                            setCollapsed(!collapsed)
                            closeModal()
                        }}
                    >
                        <Text style={s.settingsItemText}>{collapsed ? 'Expand' : 'Collapse'}</Text>
                        <IconWrap outputRange={iconWrapColors}>
                            {collapsed ? <ExpandIcon /> : <AllCollapseIcon style={{ marginLeft: 9 }} />}
                        </IconWrap>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[s.settingsItemContainer]}
                        onPress={() => {
                            if (onClone) onClone()
                            closeModal()
                        }}
                    >
                        <Text style={s.settingsItemText}>Clone</Text>
                        <IconWrap outputRange={iconWrapColors}>
                            <CloneIcon />
                        </IconWrap>
                    </TouchableOpacity>

                    <TouchableOpacity style={[s.settingsItemContainer]}>
                        <Text style={s.settingsItemText}>Move</Text>
                        <IconWrap outputRange={iconWrapColors}>
                            <MoveIcon style={{ marginTop: 5 }} />
                        </IconWrap>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[s.settingsItemContainer]}
                        onPress={() => {
                            if (onDelete) onDelete()
                            closeModal()
                        }}
                    >
                        <Text style={s.settingsItemText}>Delete</Text>
                        <IconWrap outputRange={iconWrapColors}>
                            <DeleteIcon />
                        </IconWrap>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.settingsItemContainer]}>
                        <Text style={s.settingsItemText}>Customization</Text>
                        <IconWrap outputRange={iconWrapColors}>
                            <SettingIcon />
                        </IconWrap>
                    </TouchableOpacity>
                    <CButtonInput label="Save" onPress={() => closeModal()} style={{ marginTop: 24 }} />
                </View>
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
        width: '60%',
        alignItems: 'stretch',
        backgroundColor: colors.CONTAINER_BG,
        borderRadius: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 24,
        paddingTop: 8,

    },
    headerContainerStyle: {
        marginVertical: 8,
    },
    headerLabel: {
        fontSize: 18,
        fontWeight: 'normal',
        // marginLeft: 8,
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
})
