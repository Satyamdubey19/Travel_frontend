export type ItineraryDay = { day: number; title: string; description: string; activities: string[]; meals: string[]; stayNotes: string; travelNotes: string }
export type TourForm = {
  title: string; slug: string; description: string; category: string; tags: string[]; destination: string; city: string; state: string; country: string
  latitude: string; longitude: string; startDate: string; endDate: string; registrationDeadline: string; duration: string; totalSlots: string; availableSlots: string
  maxGroupSize: string; joinApprovalRequired: boolean; womenOnly: boolean; safeForSoloWomen: boolean; verifiedTravelersOnly: boolean
  riskLevel: string; riskDisclosure: string; meetingPoint: string; eligibilityRequirements: string[]; requiredEquipment: string[]; emergencyPlan: string; minimumAge: string; requiresCaretaker: boolean
  pricePerPerson: string; originalPrice: string; difficulty: string; languages: string | string[]; cancellationPolicy: string; status: string
  highlights: string[]; included: string[]; excluded: string[]; images: string[]; itinerary: ItineraryDay[]
}
