"use client"

import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type ClientNotification = {
  id: string
  title: string
  message: string
  type?: string
  read?: boolean
}

const notificationSlice = createSlice({
  name: "notifications",
  initialState: { items: [] as ClientNotification[] },
  reducers: {
    addNotification(state, action: PayloadAction<Omit<ClientNotification, "id"> & { id?: string }>) {
      state.items.unshift({ id: action.payload.id ?? crypto.randomUUID(), read: false, ...action.payload })
    },
    markRead(state, action: PayloadAction<string>) {
      const item = state.items.find((row) => row.id === action.payload)
      if (item) item.read = true
    },
    clearNotifications(state) {
      state.items = []
    },
  },
})

export const { addNotification, clearNotifications, markRead } = notificationSlice.actions
export default notificationSlice.reducer
