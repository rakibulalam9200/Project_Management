import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Text, ActivityIndicator, Image, Alert } from 'react-native';
import colors from '../../assets/constants/colors';
import CText from '../../components/common/CText';
import IconWrap from '../../components/common/IconWrap';
import DeleteIcon from '../../assets/svg/delete_2.svg'
import EditIcon from '../../assets/svg/edit.svg'
import SettingsIcon from '../../assets/svg/settings.svg'
import BackArrow from '../../assets/svg/arrow-left.svg'
import g from '../../assets/styles/global'
import api from '../../api/api';
import { dateFormatter, dateFromatByDot, getDate, jsCoreDateCreator } from '../../utils/Timer';
import { color } from 'react-native-reanimated';
import FilesCard from '../../components/cards/FilesCard';
import { useIsFocused } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setNormal } from '../../store/slices/tab';
import { ScrollView } from 'react-native-gesture-handler';
import CButtonInput from '../../components/common/CButtonInput';

const ExpenseDetail = ({ navigation, route }) => {
    const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
    const [expenseDetail, setExpenseDetail] = useState({})
    const [loading, setLoading] = useState(false)
    const isFocused = useIsFocused()
    const dispatch = useDispatch();
    // //console.log('Timelog id', route.params.id)

    useEffect(() => {

    }, [])

    useEffect(() => {
        if (isFocused) {
            dispatch(setNormal())
        }
    }, [isFocused])

    const deleteTimelog = () => {

    }


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {/* Heading with icons */}
                <View style={[s.headerContainer, { paddingHorizontal: 24 }]}>
                    <IconWrap
                        onPress={() => {
                            navigation.goBack()
                        }}
                        outputRange={iconWrapColors}
                    >
                        <BackArrow fill={colors.NORMAL} />
                    </IconWrap>
                    <CText style={[g.title3, s.textColor]}>Expense Details</CText>
                    <View style={s.buttonGroup}>

                        <IconWrap onPress={() => { }}
                            outputRange={iconWrapColors} style={s.buttonGroupBtn}>
                            <EditIcon fill={colors.NORMAL} />
                        </IconWrap>

                        <IconWrap
                            onPress={() => deleteTimelog()}
                            outputRange={iconWrapColors}
                            style={s.buttonGroupBtn}
                        >
                            <SettingsIcon fill={colors.NORMAL} />
                        </IconWrap>
                    </View>
                </View>
                {/* Heading with icons */}

                {
                    loading ?
                        <ActivityIndicator size="small" color={colors.PRIM_BODY} />

                        :
                        // Object.keys(expenseDetail).length > 0 &&
                        <View style={{ flex: 1 }}>
                            <View style={{ paddingHorizontal: 24 }}>
                                <Text style={[s.dateText]}>{dateFormatter(new Date())}</Text>
                            </View>

                            <ScrollView style={{ marginBottom: 50, flex: 1, paddingHorizontal: 24 }}>

                                <View>
                                    <View style={[s.shortInfo]}>
                                        <Text style={{ color: colors.PRIM_CAPTION }}>Vendor:</Text>
                                        <Text style={{ fontWeight: '500' }}>OBI</Text>
                                    </View>

                                    <View style={[s.shortInfo]}>
                                        <Text style={{ color: colors.PRIM_CAPTION }}>Category:</Text>
                                        <Text style={{ fontWeight: '500' }}>Material</Text>
                                    </View>

                                    <View style={[s.shortInfo]}>
                                        <Text style={{ color: colors.PRIM_CAPTION }}>Project:</Text>
                                        <Text style={{ fontWeight: '500' }}>Project 1</Text>
                                    </View>
                                    <View style={{ paddingVertical: 10 }}>
                                        <Text style={{ color: colors.PRIM_CAPTION }}>Amount:</Text>
                                        <Text style={{ fontWeight: '700', fontSize: 28 }}>$350.47</Text>
                                    </View>
                                </View>


                                <Text style={{ fontWeight: '500' }}>Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum </Text>

                                <View>
                                    {expenseDetail?.attachments &&
                                        expenseDetail?.attachments.map((item, index) => <FilesCard key={index} item={item} />)
                                    }
                                </View>

                                <View style={{ marginVertical: 30 }}>
                                    <CButtonInput onPress={() => { }} label="For Acceptance" />
                                </View>
                            </ScrollView>
                        </View>
                }

            </View>
        </SafeAreaView >
    );
}

const s = StyleSheet.create({

    // Header with icons
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // marginBottom: 24,
        marginTop: 40,
    },
    textColor: {
        color: 'black',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buttonGroupBtn: {
        marginLeft: 10,
        width: 40,
        height: 40,
    },

    // Header with icons

    dateText: {
        color: colors.PRIM_BODY,
        fontSize: 24,
        lineHeight: 24,
        marginVertical: 24,
        fontWeight: 'bold',
        paddingVertical: 5,
        borderRadius: 10,
    },

    shortInfo: {
        paddingVertical: 10,
        borderBottomColor: colors.WHITE,
        borderBottomWidth: 1,
    }
})

export default ExpenseDetail;
