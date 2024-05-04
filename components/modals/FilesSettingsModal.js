import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native'
import React from 'react'
import CHeaderWithBack from '../common/CHeaderWithBack'
import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'

import FilterIcon from '../../assets/svg/filter.svg'
import MoveIcon from '../../assets/svg/move.svg'
import CreateTemplateIcon from '../../assets/svg/create-template.svg'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import IconWrap from '../common/IconWrap'
import CButtonInput from '../common/CButtonInput'

const FilesSettingsModal = ({
    children,
    visibility,
    setVisibility,
    navigation,
    onDelete = null,
    onFilter = null,
}) => {


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
                        iconWrapColors={iconWrapColors}
                        containerStyle={s.headerContainerStyle}
                    />

                    <TouchableOpacity
                        style={[s.settingsItemContainer]}
                        onPress={() => {
                            if (onFilter) onFilter()
                            closeModal()
                        }}
                    >
                        <Text style={s.settingsItemText}>Filter</Text>
                        <IconWrap outputRange={iconWrapColors}>
                            <FilterIcon />
                        </IconWrap>
                    </TouchableOpacity>

                    <TouchableOpacity style={[s.settingsItemContainer]}>
                        <Text style={s.settingsItemText}>Move</Text>
                        <IconWrap outputRange={iconWrapColors}>
                            <MoveIcon />
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
                </View>
            </View>
        </Modal>
    );
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
        padding: 16,
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
})

export default FilesSettingsModal;
