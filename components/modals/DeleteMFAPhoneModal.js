import React from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import CButtonInput from '../common/CButtonInput'

export default function DeleteMFAPhoneModal({
    confirmationMessage = 'This will automatically disable multi-factor authentication. However, you will be able to turn it back on later.',
    visibility,
    setVisibility,
    onDelete = null,
}) {
    const closeModal = () => {
        setVisibility(false)
    }
    const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
    return (
        <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
            <View style={[s.modalOuterContainer]}>
                <View style={s.modalContainer}>
                    <Text style={s.headerText}>Remove this phone number?</Text>
                    <Text style={s.subHeaderText}>{confirmationMessage}</Text>
                    <View style={g.containerBetween}>
                        <CButtonInput label="Cancel" onPress={closeModal} style={s.cancelButton} />
                        <CButtonInput label="Delete" onPress={onDelete} style={s.deleteButton} />
                    </View>
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
        width: '80%',
        alignItems: 'stretch',
        backgroundColor: colors.CONTAINER_BG,
        borderRadius: 20,
        padding: 16,
        margin: 8,
    },
    deleteButton: {
        backgroundColor: colors.RED_NORMAL,
    },
    cancelButton: {
        backgroundColor: colors.PRIM_CAPTION,
    },
    headerText: {
        fontFamily: 'inter-regular',
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.BLACK,
        textAlign: 'center',
        marginTop: 16,
    },
    subHeaderText: {
        fontFamily: 'inter-regular',
        fontSize: 16,
        marginVertical: 16,
        color: colors.BLACK,
        textAlign: 'center',
    },
})
