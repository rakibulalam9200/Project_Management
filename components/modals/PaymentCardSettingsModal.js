import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native'
import React from 'react'
import CHeaderWithBack from '../common/CHeaderWithBack'
import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'
import EditIon from '../../assets/svg/edit.svg'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import IconWrap from '../common/IconWrap'
import CButtonInput from '../common/CButtonInput'

export default function PaymentCardSettingsModal({
    visibility,
    setVisibility,
    makeDefault,
    deleteCard,
    data,
    goToEditCard,
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
                        iconWrapColors={iconWrapColors}
                        containerStyle={s.headerContainerStyle}
                    />

                    <TouchableOpacity
                        style={[s.settingsItemContainer]}
                        onPress={() => {
                            makeDefault(data)
                            closeModal()
                        }}
                    >
                        <Text style={s.settingsItemText}>Make Default</Text>

                    </TouchableOpacity>

                    <TouchableOpacity style={[s.settingsItemContainer]}
                        onPress={() => {
                            goToEditCard()
                            closeModal()
                        }}

                    >
                        <Text style={s.settingsItemText}>Edit</Text>
                        <IconWrap outputRange={iconWrapColors}>
                            <EditIon />
                        </IconWrap>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[s.settingsItemContainer]}
                        onPress={() => {
                            deleteCard(data)
                            closeModal()
                        }}
                    >
                        <Text style={s.settingsItemText}>Delete</Text>
                        <IconWrap outputRange={iconWrapColors}>
                            <DeleteIcon />
                        </IconWrap>
                    </TouchableOpacity>

                    <CButtonInput label='Save' style={{ paddingVertical: 10 }} />

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
