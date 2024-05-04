import { createSlice } from '@reduxjs/toolkit'
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: { currentPlan: null, subscribed: false, subscriptionNeededNewOrg: false, needIntialSubscription: false, initialPlan: null, paymentMethod: null, subscriptionId: -1, permissionLoading: false },
  reducers: {
    setCurrentPlan(state, action) {
      state.currentPlan = action.payload
    },
    setInitialPlan(state, action) {
      state.initialPlan = action.payload
    },
    setPaymentMethod(state, action) {
      state.paymentMethod = action.payload
    },
    makeSubscribed(state, action) {
      state.subscribed = true
    },
    makeUnSubscribed(state, action) {
      state.subscribed = false
    },

    setSubscriptionId(state, action) {
      state.subscriptionId = action.payload
    },

    setSubscriptionNeededNewOrg(state, action) {
      state.subscriptionNeededNewOrg = true
    },

    setSubscriptionNotNeededNewOrg(state, action) {
      state.subscriptionNeededNewOrg = false
    },

    setNeedInitialSubscription(state, action) {
      state.needIntialSubscription = true
    },

    setNotNeedInitialSubscription(state, action) {
      state.needIntialSubscription = false
    },

    setPermissionLoading(state, action) {
      state.permissionLoading = action.payload
    },

  },
})

export const { setCurrentPlan, makeSubscribed, makeUnSubscribed, setInitialPlan, setPaymentMethod, setSubscriptionNeededNewOrg, setSubscriptionNotNeededNewOrg, setSubscriptionId, setNeedInitialSubscription, setNotNeedInitialSubscription, setPermissionLoading } =
  subscriptionSlice.actions
export default subscriptionSlice.reducer
