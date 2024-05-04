import { createSlice } from '@reduxjs/toolkit'
const navigationSlice = createSlice({
  name: 'navigation',
  initialState: {
    currentProject: null,
    currentMilestone: null,
    currentTaskIds: [],
    currentTask: null,
    currentIssue: null,
    currentEvent: null,
    stage: '',
    navigationFrom: '',
    calendarLoading: false,
    searchNavigationFrom: '',
    currentRoute: '',
    currentClientGroupId: null,
  },
  reducers: {
    setCurrentProject(state, action) {
      state.currentProject = action.payload
    },
    setCurrentMilestone(state, action) {
      state.currentMilestone = action.payload
    },
    setCurrentTask(state, action) {
      state.currentTask = action.payload
    },
    setCurrentTaskIds(state, action) {
      state.currentTaskIds = action.payload
    },

    setCurrentIssue(state, action) {
      state.currentIssue = action.payload
    },
    setCurrentEvent(state, action) {
      state.currentEvent = action.payload
    },

    setStage(state, action) {
      state.stage = action.payload
    },

    setNavigationFrom(state, action) {
      state.navigationFrom = action.payload
    },
    setSearchNavigationFrom(state, action) {
      state.searchNavigationFrom = action.payload
    },

    setCalendarLoading(state, action) {
      state.calendarLoading = action.payload
    },
    setCurrentRoute(state,action){
      state.currentRoute = action.payload
    },
    setCurrentClientGroupId(state,action){
      state.currentClientGroupId = action.payload
    }

  },
})

export const {
  setCurrentProject,
  setCurrentMilestone,
  setCurrentTaskIds,
  setCurrentTask,
  setCurrentIssue,
  setStage,
  setCalendarLoading,
  setNavigationFrom,
  setSearchNavigationFrom,
  setCurrentRoute,
  setCurrentEvent,
  setCurrentClientGroupId
} = navigationSlice.actions
export default navigationSlice.reducer
