"use client"

import { configureStore } from "@reduxjs/toolkit"
import modalReducer from "./modalSlice"
import notificationReducer from "./notificationSlice"
import socketReducer from "./socketSlice"
import tourBookingWizardReducer from "./tourBookingWizardSlice"

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    notifications: notificationReducer,
    socket: socketReducer,
    tourBookingWizard: tourBookingWizardReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
