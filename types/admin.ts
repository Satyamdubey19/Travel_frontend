export type AdminBooking = {
  id: string
  code?: string
  guestName: string
  guestEmail: string
  tourName?: string | null
  hostName: string
  checkInDate?: string | null
  checkOutDate?: string | null
  startDate?: string | null
  endDate?: string | null
  totalPrice?: number
  status: string
  isOverridden?: boolean
  createdAt?: string
}
