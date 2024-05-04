import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/auth'
import userReducer from './slices/user'
import tabReducer from './slices/tab'
import navigationReducer from './slices/navigation'
import subscriptionReducer from './slices/subscription'
import supportApi from './slices/supportApi'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    tab: tabReducer,
    navigation: navigationReducer,
    subscription: subscriptionReducer,
    [supportApi.reducerPath]: supportApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(supportApi.middleware),
})
