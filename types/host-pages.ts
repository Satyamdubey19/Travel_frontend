export type HostBookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show"
  | "refund_pending";

export type HostBooking = {
  id: string;
  bookingCode: string;
  bookingType: "tour" | "activity" | "rental";
  status: HostBookingStatus;
  guest: { name: string; email: string; phone?: string };
  tour?: { name: string; city?: string | null; area?: string | null } | null;
  numberOfGuests: number;
  totalPrice: number;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  quantityLabel?: string;
  startTime?: string | null;
  specialRequests?: string | null;
  payment?: {
    status: string;
    grossAmount?: number;
    hostEarnings?: number | null;
    platformFee?: number | null;
  } | null;
  refund?: {
    status: string;
    requestedAmount: number;
    approvedAmount?: number | null;
  } | null;
  rooms?: Array<{
    id: string;
    name: string;
    quantity: number;
    availableRooms: number;
    bookedRooms: number;
  }>;
};
export type HostBookingActionProps = {
  booking: HostBooking;
  onStatusChange: (booking: HostBooking, status: string) => void;
};
