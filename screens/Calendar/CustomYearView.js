//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../assets/constants/colors';
import { getMonth, getMonthAllDays, getMonthDay, jsCoreDateCreator } from '../../utils/Timer';


const weekDays = [
  {
    name: 'Sunday',
    short: 'S',
    number: 0,
  },
  {
    name: 'Monday',
    short: 'M',
    number: 1,
  },
  {
    name: 'Tuesday',
    short: 'T',
    number: 2,
  },
  {
    name: 'Wednesday',
    short: 'W',
    number: 3,
  },
  {
    name: 'Thursday',
    short: 'T',
    number: 4,
  },
  {
    name: 'Friday',
    short: 'F',
    number: 5,
  },
  {
    name: 'Saturday',
    short: 'S',
    number: 6,
  },

]


// create a component
const CustomYearView = () => {


  const MonthRender = ({ item }) => {
    const date = jsCoreDateCreator(item)
    const month = getMonth(date)

    let monthDays = getMonthAllDays(date, item)

    return (
      <View>

        <Text>{month}</Text>
        <View style={{ flexDirection: 'row', width: '45%', borderWidth: 1, borderColor: 'blue' }}>
          {weekDays.map((day, index) => {
            return (
              <View key={index} style={{ alignItems: 'center', borderColor: 'red', borderWidth: 1, width: '14%' }}>
                <Text>{day.short}</Text>
              </View>
            )
          })
          }
        </View>
        <View style={{ flexDirection: 'row', width: '45%', borderWidth: 1, borderColor: 'purple', flexWrap: 'wrap' }}>
          {monthDays.map((day, index) => {
            return (
              <View key={index} style={{ width: '14%', borderColor: 'green', borderWidth: 1, alignItems: 'center' }}>
                <Text>{day}</Text>
              </View>
            )
          })
          }
        </View>
        <View>

        </View>
      </View>
    )
  }




  return (
    <View style={s.container}>
      {/* <Text>CustomYearView</Text> */}
      <MonthRender item={'2023-05-01'} />
    </View>
  );
};

// define your styles
const s = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: colors.MID_BG,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
});

//make this component available to the app
export default CustomYearView;
