"use client"

import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { TourBookingWizardState, TourBookingWizardStep } from "@/types/tour-booking"
import type { TourTravelerInput } from "@/validators/tour-booking.validators"

const initialState: TourBookingWizardState = {
  activeStep: "departure",
  travelers: [],
}

const tourBookingWizardSlice = createSlice({
  name: "tourBookingWizard",
  initialState,
  reducers: {
    startWizard(state, action: PayloadAction<{ tourId?: string; tourSlug?: string; departureBatchId?: string }>) {
      state.tourId = action.payload.tourId
      state.tourSlug = action.payload.tourSlug
      state.departureBatchId = action.payload.departureBatchId
      state.activeStep = "departure"
      state.travelers = []
      state.bookingId = undefined
      state.bookingCode = undefined
    },
    setDepartureBatch(state, action: PayloadAction<string | undefined>) {
      state.departureBatchId = action.payload
    },
    setActiveStep(state, action: PayloadAction<TourBookingWizardStep>) {
      state.activeStep = action.payload
    },
    upsertTraveler(state, action: PayloadAction<{ index: number; traveler: TourTravelerInput }>) {
      state.travelers[action.payload.index] = action.payload.traveler
    },
    removeTraveler(state, action: PayloadAction<number>) {
      state.travelers.splice(action.payload, 1)
    },
    setBookingResult(state, action: PayloadAction<{ bookingId: string; bookingCode: string }>) {
      state.bookingId = action.payload.bookingId
      state.bookingCode = action.payload.bookingCode
      state.activeStep = "confirmation"
    },
    resetWizard() {
      return initialState
    },
  },
})

export const { removeTraveler, resetWizard, setActiveStep, setBookingResult, setDepartureBatch, startWizard, upsertTraveler } = tourBookingWizardSlice.actions
export default tourBookingWizardSlice.reducer
