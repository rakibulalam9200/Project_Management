import { createNativeStackNavigator } from '@react-navigation/native-stack'
import MonthView from '../../screens/Calendar/MonthView'
import DayView from '../../screens/Calendar/DayView'
import YearView from '../../screens/Calendar/YearView'
import WeekView from '../../screens/Calendar/WeekView'
import AddOrEditEvent from '../../screens/Event/AddOrEditEvent'
import AddOrEditCalendar from '../../screens/Calendar/AddOrEditCalendar'
import CalendarSearchScreen from '../../screens/Calendar/CalendarSearchScreen'
import EventDetailsScreen from '../../screens/Event/EventDetailsScreen'
const Stack = createNativeStackNavigator()

export default function CalendarStack() {
  return (
    <Stack.Navigator
      name="Calendar"
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName='YearView'
    >
      <Stack.Screen name="YearView" component={YearView} />
      <Stack.Screen name="DayView" component={DayView} />
      <Stack.Screen name="MonthView" component={MonthView} />
      <Stack.Screen name="WeekView" component={WeekView} />
      <Stack.Screen name="AddEvent" component={AddOrEditEvent} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      <Stack.Screen name="AddOrEditCalendar" component={AddOrEditCalendar} />
      <Stack.Screen name="CalendarSearch" component={CalendarSearchScreen} />
    </Stack.Navigator>
  )
}
