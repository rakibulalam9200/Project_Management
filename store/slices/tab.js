import { createSlice } from '@reduxjs/toolkit'
const tabSlice = createSlice({
  name: 'tab',
  initialState: {
    showPlus: false,
    plusDestination: '',
    plusDesinationParams: null,
    showFileUploadModal: false,
    showBottomTabBar: true,
    tabbarHeight: 0,
  },
  reducers: {
    setNormal(state, action) {
      state.showPlus = false
    },
    setPlus(state) {
      state.showPlus = true
    },
    setPlusDestination(state, action) {
      state.plusDestination = action.payload
    },
    setPlusDestinationParams(state, action) {
      state.plusDestinationParams = action.payload
    },

    setShowFileUploadModal(state) {
      state.showFileUploadModal = !state.showFileUploadModal
    },
    setShowBottomTabBar(state, action) {
      //console.log(action.payload, 'action.payload...')
      state.showBottomTabBar = action.payload
    },
    setTabbarHeight(state, action) {
      state.tabbarHeight = action.payload
    },
  },
})

export const {
  setNormal,
  setPlus,
  setPlusDestination,
  setPlusDestinationParams,
  setShowFileUploadModal,
  setTabbarHeight,
} = tabSlice.actions
export default tabSlice.reducer
