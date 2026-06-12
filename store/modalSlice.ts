"use client"

import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type ModalState = {
  activeModal: string | null
  payload?: Record<string, unknown>
}

const initialState: ModalState = { activeModal: null }

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<ModalState>) {
      state.activeModal = action.payload.activeModal
      state.payload = action.payload.payload
    },
    closeModal() {
      return initialState
    },
  },
})

export const { closeModal, openModal } = modalSlice.actions
export default modalSlice.reducer
