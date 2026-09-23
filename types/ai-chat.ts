export type AITourCard = { name: string; city: string; duration: number; price: number; link: string }
export type AIActivityCard = { name: string; city: string; price: number; link: string }
export type AIRentalCard = { name: string; city: string; price: number; link: string }
export type AiChatMessage = { id: number; role: "user" | "assistant"; text: string; tours?: AITourCard[]; activities?: AIActivityCard[]; rentals?: AIRentalCard[] }
export type AiChatResponse = { message?: string; tours?: AITourCard[]; activities?: AIActivityCard[]; rentals?: AIRentalCard[] }
