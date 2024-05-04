import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import colors from '../../assets/constants/colors';
import g from '../../assets/styles/global'

const Spinner = () => {
    return (
        <View style={[g.container, s.container]}>
            <ActivityIndicator size="large" color={colors.WHITE} />
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        backgroundColor: colors.NORMAL,
        padding: 23,
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default Spinner;
