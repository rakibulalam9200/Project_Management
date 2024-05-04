import React, { useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import g from '../../assets/styles/global'
import IconWrap from '../../components/common/IconWrap';
import FilterIcon from '../../assets/svg/filter.svg'
import SettingsIcon from '../../assets/svg/settings.svg'
import SortIcon from '../../assets/svg/sort.svg'
import CText from '../../components/common/CText';
import colors from '../../assets/constants/colors';
import BackArrow from '../../assets/svg/arrow-left.svg'
import CSearchInput from '../../components/common/CSearchInput';
import { useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPlus, setPlusDestination } from '../../store/slices/tab';
import CDateTime from '../../components/common/CDateTime';
import api from '../../api/api';
import { dateFormatter, getDate, jsCoreDateCreator } from '../../utils/Timer';
import DraggableFlatList from 'react-native-draggable-flatlist';
import CCheckbox from '../../components/common/CCheckbox';
import { getErrorMessage } from '../../utils/Errors';
import TimelogFilterModal from '../../components/modals/TimelogFilterModal';
import { objectToArray } from '../../utils/Strings';

import DownIcon from '../../assets/svg/arrow-down.svg'
import UpIcon from '../../assets/svg/arrow-up.svg'
import CrossIcon from '../../assets/svg/cross.svg'

const ExpenseScreen = ({ navigation, route }) => {

    const { refresh } = route.params || { refresh: false }

    const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

    const [search, setSearch] = useState('')
    const [query, setQuery] = useState('')

    const isFocused = useIsFocused()
    const dispatch = useDispatch()

    const [expense, setExpense] = useState([{ id: 1, date: "2023-03-09 17:06:12" }])
    const [filteredExpense, setFilteredExpense] = useState([])
    const [searchedExpense, setSearchedExpense] = useState([])
    const [loading, setLoading] = useState(false)

    const multipleSelect = useRef({})
    const [selectable, setSelectable] = useState(false)

    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const [showFiltersModal, setShowFiltersModal] = useState(false)

    const [selectedAuthors, setSelectedAuthors] = useState([])
    const [selectedProject, setSelectedProject] = useState({ id: -1, name: '' })

    const [selectedMilestone, setSelectedMilestone] = useState({ id: -1, name: '' })
    const [selectedTask, setSelectedTask] = useState({ id: -1, name: '' })
    const [selectedDate, setSelectedDate] = useState(null)

    const [showFilters, setShowFilters] = useState(false)
    const [hideFilters, setHideFilters] = useState(false)
    const [refetch, setRefetch] = useState(false)

    useEffect(() => {
        if (isFocused) {
            dispatch(setPlus())
            dispatch(setPlusDestination('TimelogAdd'))
        }
    }, [isFocused])

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setQuery(search)
        }, 700)

        return () => clearTimeout(delayDebounceFn)
    }, [search])

    // Fetch expenses
    useEffect(() => {

        const body = {}

        if (query != '') {
            body['search'] = query
            // setLoading(true)
            // fetch expenses for search
        } else {

            // setLoading(true)
            // fetch expenses for default
        }


    }, [isFocused, query, refetch])


    // Filter expenses
    useEffect(() => {
        const body = {

        }


        if (selectedAuthors.length > 0 || selectedProject.id != -1 || selectedTask.id != -1 || selectedDate != null) {
            // setLoading(true)
            // fetch expenses for filter
        }
    }, [showFilters, selectedAuthors, selectedProject, selectedTask, selectedDate])



    // Reset Filters
    const resetUsers = () => {
        setSelectedAuthors([])
    }

    const resetProject = () => {
        setSelectedProject({ id: -1, name: '' })
    }

    const resetMilestone = () => {
        setSelectedMilestone({ id: -1, name: '' })
    }

    const resetTask = () => {
        setSelectedMilestone({ id: -1, name: '' })
        setSelectedTask({ id: -1, name: '' })
    }

    const resetDate = () => {
        setSelectedDate(null)
    }


    useEffect(() => {
        // //console.log('Selected Authors', selectedAuthors.length, selectedProject.id, selectedMilestone.id, selectedTask.id)
        if (selectedAuthors.length == 0 && selectedProject.id == -1 && selectedTask.id == -1 && selectedDate == null) {
            setShowFilters(false)
            multipleSelect.current = {}

        } else {
            setShowFilters(true)
        }
    }, [selectedAuthors, selectedProject, selectedMilestone, selectedTask, selectedDate])


    // Expense card
    const ExpenseCard = ({ item, drag }) => {

        const date = item?.date.split(' ')[0].toString().split('-').reverse().join('.')

        const [checked, setChecked] = useState(() => {
            if (multipleSelect.current[item?.id]) {
                return true
            }
            else {
                return false
            }
        })

        const toggleDeleteMultiple = () => {
            multipleSelect.current[item?.id] = multipleSelect.current[item?.id] ? undefined : true
        }

        return (
            <TouchableWithoutFeedback
                onLongPress={() => {
                    setSelectable((prev) => !prev)
                }}
                onPress={() => {
                    navigation.navigate('ExpenseDetail', { id: item?.id })
                }}
            // key={index}
            >

                <View style={[s.expenseCard]}>


                    <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}  >
                        <CText style={{ color: colors.PRIM_CAPTION }}>{date}</CText>
                        <CText style={{ fontWeight: '500', marginTop: 4, fontSize: 14, color: colors.PRIM_CAPTION }}>Category: <CText style={{ color: 'black' }}>Category</CText> </CText>

                        <CText style={{ fontWeight: '500', fontSize: 14, color: colors.PRIM_CAPTION }}>Amount: <CText style={{ color: 'black' }}>Amount</CText> </CText>

                    </View>

                    <View style={{ justifyContent: 'space-between' }}>
                        <View style={{ alignSelf: 'flex-end' }}>
                            {
                                selectable && (
                                    <CCheckbox
                                        showLabel={false}
                                        checked={checked}
                                        setChecked={setChecked}
                                        onChecked={toggleDeleteMultiple}
                                    />
                                )
                            }
                        </View>
                        <View>
                            {/* <Text style={{ fontSize: 16, fontWeight: '500' }}>{item?.number_of_hour}</Text> */}
                            <Text style={{ fontSize: 12, fontWeight: '500', color: colors.SECONDARY }}>by Username Surname</Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    }



    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ paddingHorizontal: 24, flex: 1 }}>

                <TimelogFilterModal
                    showFilterModal={showFiltersModal}
                    setShowFilterModal={setShowFiltersModal}
                    selectedUsers={selectedAuthors}
                    setSelectedUsers={setSelectedAuthors}
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                    setShowParentFilters={setShowFilters}
                    selectedMilestone={selectedMilestone}
                    setSelectedMilestone={setSelectedMilestone}
                    selectedTask={selectedTask}
                    setSelectedTask={setSelectedTask}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                />

                {/* Heading with icons */}
                <View style={s.headerContainer}>
                    <IconWrap
                        onPress={() => {
                            navigation.goBack()
                        }}
                        outputRange={iconWrapColors}
                    >
                        <BackArrow fill={colors.NORMAL} />
                    </IconWrap>
                    <CText style={[g.title3, s.textColor]}>Project Name 1</CText>
                    <View style={s.buttonGroup}>
                        <IconWrap
                            onPress={() => {
                                setShowSettingsModal(true)
                            }}
                            outputRange={iconWrapColors}
                            style={s.buttonGroupBtn}
                        >
                            <SettingsIcon fill={colors.NORMAL} />
                        </IconWrap>
                        <IconWrap
                            onPress={() => {
                                setShowFiltersModal(true)
                            }}
                            outputRange={iconWrapColors}
                            style={s.buttonGroupBtn}
                        >
                            <FilterIcon fill={colors.NORMAL} />
                        </IconWrap>

                    </View>
                </View>
                {/* Heading with icons */}
                <CSearchInput placeholder="Search" value={search} setValue={setSearch} />
                {
                    selectable &&
                    <TouchableOpacity
                        onPress={() => {
                            setSelectable(false)
                        }}
                    >
                        <BackArrow fill={colors.NORMAL} />
                    </TouchableOpacity>
                }

                {
                    showFilters && (
                        <View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                <Text style={s.filterText}>Filters</Text>
                                {
                                    !hideFilters ?
                                        <TouchableOpacity onPress={() => {
                                            setHideFilters(true)
                                        }}>

                                            <UpIcon />
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity onPress={() => {
                                            setHideFilters(false)
                                        }}>
                                            <DownIcon />
                                        </TouchableOpacity>
                                }
                            </View>

                            {
                                !hideFilters && (

                                    <View style={[s.filterBoxesContainer]}>
                                        <View style={s.filterContainer}>
                                            {
                                                selectedAuthors.length > 0 &&
                                                selectedAuthors.map((user, id) => {
                                                    return (
                                                        <View style={[s.userItemContainer]} key={id}>
                                                            <Text style={s.userItemTextDark}>{user?.name}</Text>
                                                        </View>
                                                    )
                                                })
                                            }
                                            {
                                                selectedAuthors.length > 0 && (
                                                    <TouchableOpacity onPress={resetUsers}>
                                                        <CrossIcon />
                                                    </TouchableOpacity>
                                                )
                                            }
                                        </View>
                                        <View style={s.filterContainer}>
                                            {
                                                selectedProject.id !== -1 &&
                                                <View style={[s.userItemContainer]}>
                                                    <Text style={s.userItemTextDark}>{selectedProject?.name}</Text>
                                                </View>
                                            }
                                            {
                                                selectedProject.id !== -1 && (
                                                    <TouchableOpacity onPress={resetProject}>

                                                        <CrossIcon />
                                                    </TouchableOpacity>
                                                )
                                            }
                                        </View>
                                        <View style={s.filterContainer}>
                                            {
                                                selectedTask.id !== -1 &&
                                                <View style={[s.userItemContainer]}>
                                                    <Text style={s.userItemTextDark}>{selectedTask?.name}</Text>
                                                </View>
                                            }
                                            {
                                                selectedTask.id !== -1 && (
                                                    <TouchableOpacity onPress={resetTask}>

                                                        <CrossIcon />
                                                    </TouchableOpacity>
                                                )
                                            }
                                        </View>
                                        <View style={s.filterContainer}>
                                            {
                                                selectedDate &&
                                                <View style={[s.userItemContainer]}>
                                                    <Text style={s.userItemTextDark}>{dateFormatter(selectedDate)}</Text>
                                                </View>
                                            }
                                            {
                                                selectedDate && (
                                                    <TouchableOpacity onPress={resetDate}>

                                                        <CrossIcon />
                                                    </TouchableOpacity>
                                                )
                                            }
                                        </View>

                                    </View>
                                )
                            }

                        </View>
                    )
                }

                <View style={[s.listContainer]}>

                    {loading && <ActivityIndicator size="small" color={colors.NORMAL} />}
                    {
                        !loading &&
                        <DraggableFlatList
                            showsVerticalScrollIndicator={false}
                            data={!showFilters && !query != '' ? expense : showFilters ? filteredExpense : query != '' ? searchedExpense : expense}
                            onDragBegin={() => { }}
                            onDragEnd={({ data }) => {
                                setExpense(data)
                            }}

                            keyExtractor={(item) => item.id}
                            renderItem={ExpenseCard}
                            containerStyle={{
                                flex: 1,
                                flexDirection: 'row',
                                paddingHorizontal: 10,
                                marginBottom: 100,
                            }}

                        />
                    }
                    {/* {
                        !loading && showFilters &&
                        <DraggableFlatList
                            showsVerticalScrollIndicator={false}
                            data={filteredExpense}
                            onDragBegin={() => { }}
                            onDragEnd={({ data }) => {
                                setFilteredExpense(data)
                            }}

                            keyExtractor={(item) => item.id}
                            renderItem={ExpenseCard}
                            containerStyle={{
                                flex: 1,
                                flexDirection: 'row',
                                paddingHorizontal: 10,
                                marginBottom: 100,
                            }}

                        />
                    }
                    {
                        !loading && query != '' &&
                        <DraggableFlatList
                            showsVerticalScrollIndicator={false}
                            data={searchedExpense}
                            onDragBegin={() => { }}
                            onDragEnd={({ data }) => {
                                setSearchedExpense(data)
                            }}

                            keyExtractor={(item) => item.id}
                            renderItem={ExpenseCard}
                            containerStyle={{
                                flex: 1,
                                flexDirection: 'row',
                                paddingHorizontal: 10,
                                marginBottom: 100,
                            }}

                        />
                    } */}

                </View>


            </View>

        </SafeAreaView>
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
        // marginTop: 24,
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
    },

    // Header with icons

    listContainer: {
        flex: 1,
    },

    filterText: {
        color: colors.HOME_TEXT,
        fontSize: 16,
        fontWeight: 'bold',
    },
    userItemTextDark: {
        color: colors.HOME_TEXT,
    },

    filterBoxesContainer: {
        flexDirection: 'row',
        // justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 10,
    },

    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    userItemContainer: {
        backgroundColor: colors.WHITE,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 16,
        marginVertical: 8,
        marginHorizontal: 4,
    },


    expenseCard: {
        flexDirection: 'row',
        borderWidth: 1,
        backgroundColor: colors.WHITE,
        borderColor: colors.MID_BG,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        justifyContent: 'space-between',
        marginVertical: 10,
    },


})

export default ExpenseScreen;
