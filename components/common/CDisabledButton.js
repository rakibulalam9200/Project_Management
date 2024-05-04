import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React from 'react'
import colors from '../../assets/constants/colors'
export default function CDisabledButton({ style, label = 'Button', onPress, disbale, textStyle }) {
    return (
        <TouchableOpacity style={[s.buttonContainer, style]} onPress={onPress} disabled={disbale}>
            <Text style={[s.buttonText, textStyle]}>{label}</Text>
        </TouchableOpacity>
    )
}

const s = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 30,
        backgroundColor: colors.PRIM_CAPTION,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },

    buttonText: {
        color: colors.WHITE,
        fontWeight: 'bold',
        fontSize: 18,
    },
})
