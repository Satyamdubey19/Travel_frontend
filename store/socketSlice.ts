"use client"

import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

const socketSlice = createSlice({
  name: "socket",
  initialState: { connected: false, reconnecting: false, room: null as string | null },
  reducers: {
    setSocketConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload
      state.reconnecting = false
    },
    setSocketReconnecting(state, action: PayloadAction<boolean>) {
      state.reconnecting = action.payload
    },
    setSocketRoom(state, action: PayloadAction<string | null>) {
      state.room = action.payload
    },
  },
})

export const { setSocketConnected, setSocketReconnecting, setSocketRoom } = socketSlice.actions
export default socketSlice.reducer
