export type HomeFeature = {
  id: string
  title: string
  subtitle: string
  description: string
}

export type HomeCard = {
  id: string
  name: string
  location: string
  description: string
  price: string
  rating: number
}

export type HomeData = {
  hero: {
    title: string
    subtitle: string
    buttonLabel: string
  }
  features: HomeFeature[]
  featuredTrips: HomeCard[]
}

export const homeData: HomeData = {
  hero: {
    title: "Plan travel with GetHotels",
    subtitle: "Explore tours, activities, and rentals across premium destinations.",
    buttonLabel: "Explore Trips",
  },
  features: [
    {
      id: "feature-1",
      title: "Curated tours",
      subtitle: "Hosted itineraries",
      description: "Find multi-day trips with clear inclusions, dates, and pricing.",
    },
    {
      id: "feature-2",
      title: "Local activities",
      subtitle: "Bookable experiences",
      description: "Compare guided experiences, outdoor adventures, and city activities.",
    },
    {
      id: "feature-3",
      title: "Flexible rentals",
      subtitle: "Move freely",
      description: "Reserve vehicles and travel rentals for your itinerary.",
    },
  ],
  featuredTrips: [
    {
      id: "trip-1",
      name: "Himalayan Adventure",
      location: "Manali, India",
      description: "A hosted mountain itinerary with group travel support.",
      price: "Rs. 12,000",
      rating: 4.7,
    },
    {
      id: "trip-2",
      name: "Goa Activity Pass",
      location: "Goa, India",
      description: "Water sports, local food trails, and guided beach experiences.",
      price: "Rs. 3,500",
      rating: 4.5,
    },
    {
      id: "trip-3",
      name: "Jaipur Heritage Tour",
      location: "Jaipur, India",
      description: "Culture, history, and city highlights in one curated plan.",
      price: "Rs. 8,000",
      rating: 4.8,
    },
  ],
}
