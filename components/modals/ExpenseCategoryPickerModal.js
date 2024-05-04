import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native'
import React from 'react'
import CHeaderWithBack from '../common/CHeaderWithBack'
import colors from '../../assets/constants/colors'
import CButtonInput from '../common/CButtonInput'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'

const categories = [
    { id: 1, name: 'Tool' },
    { id: 2, name: 'Materials' },
    { id: 3, name: 'Service' },
    { id: 4, name: 'Other' },
]

export default function ExpenseCategoryPickerModal({
    visibility,
    setVisibility,
    selected,
    setSelected,
}) {
    const closeModal = () => {
        setVisibility(false)
    }

    const checkIfSelected = (category) => {
        return selected.id == category.id
    }

    const toggleSelected = (category) => {
        if (category.id == selected.id) setSelected({ id: -1 })
        else {
            setSelected(category)

        }
    }

    const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
    return (
        <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
            <View style={[s.modalOuterContainer]}>
                <View style={s.modalContainer}>
                    <CHeaderWithBack
                        onPress={closeModal}
                        title="Category"
                        labelStyle={s.headerLabel}
                        iconWrapColors={iconWrapColors}
                        containerStyle={s.headerContainerStyle}
                    />

                    {
                        categories.map((category) => (
                            <TouchableOpacity
                                style={[s.settingsItemContainer]}
                                onPress={() => {
                                    toggleSelected(category)
                                }}
                                key={category.id}
                            >
                                <Text style={s.settingsItemText}>{category.name}</Text>

                                {checkIfSelected(category) ? <RadioFilledIcon /> : <RadioEmptyIcon />}

                            </TouchableOpacity>
                        ))
                    }

                    <CButtonInput label='Save' onPress={closeModal} />
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
