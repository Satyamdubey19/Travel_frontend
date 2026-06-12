"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api, { getApiErrorMessage } from "@/lib/axios"
import type { AddTourTravelersInput, CancelTourBookingInput, CreateTourBookingIntentInput, ValidateTourTravelerInput } from "@/validators/tour-booking.validators"
import type { TourBookingIntentResult } from "@/types/tour-booking"

export function useTourBatches(tourIdOrSlug: string) {
  return useQuery({
    queryKey: ["tour", tourIdOrSlug, "batches"],
    queryFn: async () => {
      const { data } = await api.get(`/tour/${tourIdOrSlug}/batches`)
      return data.data as Array<{
        id: string
        label: string | null
        startDate: string
        endDate: string
        seatsLeft: number
        currentPrice: number
        status: string
      }>
    },
    enabled: Boolean(tourIdOrSlug),
  })
}

export function useCreateTourBookingIntent(tourIdOrSlug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateTourBookingIntentInput) => {
      try {
        const { data } = await api.post(`/tour/${tourIdOrSlug}/booking-intents`, payload)
        return data.data as TourBookingIntentResult
      } catch (error) {
        throw new Error(getApiErrorMessage(error, "Could not create booking"))
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tour", tourIdOrSlug] })
    },
  })
}

export function useAddTourTravelers(bookingId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AddTourTravelersInput) => {
      try {
        const { data } = await api.post(`/tour-bookings/${bookingId}/travelers`, payload)
        return data.data as { added: number; status: string }
      } catch (error) {
        throw new Error(getApiErrorMessage(error, "Could not add travelers"))
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tour-booking", bookingId] })
    },
  })
}

export function useCancelTourBooking(bookingId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CancelTourBookingInput) => {
      const { data } = await api.post(`/tour-bookings/${bookingId}/cancel`, payload)
      return data.data as { bookingId: string; refundPercent: number; refundAmount: number }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tour-booking", bookingId] })
    },
  })
}

export function useValidateTourTraveler(tourIdOrSlug: string) {
  return useMutation({
    mutationFn: async (payload: ValidateTourTravelerInput) => {
      try {
        const { data } = await api.post(`/tour/${tourIdOrSlug}/validate-traveler`, payload)
        return data.data as {
          isDuplicate: boolean
          message: string
          maskedAadhaar: string
        }
      } catch (error) {
        throw new Error(getApiErrorMessage(error, "Could not validate traveler"))
      }
    },
  })
}
