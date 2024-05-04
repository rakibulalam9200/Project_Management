import { Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { View, StyleSheet } from 'react-native';
import CText from './CText';
import colors from '../../assets/constants/colors';

const items = ['Year', 'Month', 'Week', 'Day']

const CCalendarTopTab = ({
    onPress,
    active
}) => {
    return (
        <View style={s.tabsContainer}>

            {
                items.map((item, index) => {
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                // //console.log(item, "item")
                                onPress(item)
                            }}
                            style={[s.tab, active === item && s.tabActive]}
                        >
                            <CText style={{ textAlign: 'center', color: active === item ? colors.WHITE : colors.BLACK }}>{item}</CText>
                        </TouchableOpacity>
                    )
                })
            }

        </View>
    );
}

const s = StyleSheet.create({
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    tab: {
        backgroundColor: colors.WHITE,
        paddingVertical: 10,
        // paddingHorizontal: 15,
        borderRadius: 10,
        width: '23%',
        textAlign: 'center',
    },
    tabActive: {
        backgroundColor: '#246BFD',
    },
})

export default CCalendarTopTab;
