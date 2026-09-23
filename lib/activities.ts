export type ActivityCategory = "adventure" | "wellness" | "heritage" | "water" | "food" | "culture" | "nature" | "sports"

export type Activity = {
  slug: string
  title: string
  category: ActivityCategory
  city: string
  area: string
  image: string
  price: number
  originalPrice: number
  duration: string
  rating: number
  reviews: number
  groupSize: string
  startTimes: string[]
  slots?: Array<{ id: string; date: string; startTime: string; spotsLeft: number }>
  language: string
  difficulty: "Easy" | "Moderate" | "High"
  highlights: string[]
  included: string[]
  itinerary: string[]
  cancellationPolicy?: string | null
  host: { name: string; verified: boolean; responseTime: string }
}

export const activities: Activity[] = [
  {
    slug: "udaipur-lake-pichola-sunset-kayak",
    title: "Lake Pichola Sunset Kayak & Heritage Cruise",
    category: "water",
    city: "Udaipur",
    area: "Ambrai Ghat",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    price: 1800,
    originalPrice: 2400,
    duration: "2.5 hours",
    rating: 4.9,
    reviews: 142,
    groupSize: "Up to 8 guests",
    startTimes: ["16:00", "16:45"],
    language: "English, Hindi",
    difficulty: "Easy",
    highlights: [
      "Glide past the illuminated Taj Lake Palace at dusk",
      "High-stability sit-on-top sea kayaks with imported PFDs",
      "Certified water rescue instructor & safety boat escort",
      "Rooftop post-kayak herbal tea & Rajasthani snacks included"
    ],
    included: [
      "Perception / SeaBird professional kayak & carbon paddle",
      "Coast guard approved life jacket",
      "Waterproof dry pouch for phone / cameras",
      "Traditional tea and evening snacks at Ambrai"
    ],
    itinerary: [
      "Safety briefing and gear fitting at Ambrai steps (20 mins)",
      "Paddle through the serene waters of Lake Pichola (75 mins)",
      "Golden hour photo stop facing Jag Mandir island (25 mins)",
      "Debrief and evening tea at heritage viewpoint (30 mins)"
    ],
    cancellationPolicy: "Free cancellation up to 24 hours before slot time.",
    host: { name: "City Experiences India", verified: true, responseTime: "within 30 mins" }
  },
  {
    slug: "bangalore-craft-coffee-roastery-tour",
    title: "Artisanal Single-Origin Coffee Roastery & Tasting",
    category: "food",
    city: "Bengaluru",
    area: "Indiranagar",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
    price: 1250,
    originalPrice: 1600,
    duration: "2 hours",
    rating: 4.88,
    reviews: 98,
    groupSize: "Up to 10 guests",
    startTimes: ["10:30", "15:30"],
    language: "English",
    difficulty: "Easy",
    highlights: [
      "Live drum roaster demonstration with Q-grader roasters",
      "Cupping session tasting 5 estate coffees from Coorg and Chikmagalur",
      "Hands-on pour-over and Aeropress extraction lab",
      "Freshly roasted 250g customized bean pouch to take home"
    ],
    included: [
      "All tasting samples and brewing materials",
      "Freshly baked pastries pairing",
      "Complimentary take-home 250g coffee bag",
      "Official home brewing recipe card"
    ],
    itinerary: [
      "Origin story of Indian shade-grown coffee (20 mins)",
      "Live roasting physics and crack profiles (30 mins)",
      "Sensory cupping lab (40 mins)",
      "Hands-on manual brewing workshop (30 mins)"
    ],
    cancellationPolicy: "Full refund up to 12 hours prior to scheduled session.",
    host: { name: "City Experiences India", verified: true, responseTime: "within an hour" }
  },
  {
    slug: "pune-sinhagad-cycling-breakfast-ride",
    title: "Dawn Sinhagad Foothills Cycling & Rustic Breakfast",
    category: "adventure",
    city: "Pune",
    area: "Sinhagad Ghat",
    image: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=1000&q=80",
    price: 1450,
    originalPrice: 1900,
    duration: "4 hours",
    rating: 4.82,
    reviews: 76,
    groupSize: "Up to 12 riders",
    startTimes: ["05:30"],
    language: "English, Marathi, Hindi",
    difficulty: "Moderate",
    highlights: [
      "Trek 24-gear hybrid or MTB cycle included with safety helmet",
      "Crisp misty morning ride along Khadakwasla backwaters",
      "Scenic climb to Sinhagad base village",
      "Authentic Maharashtrian pithla-bhakri and matka dahi breakfast"
    ],
    included: [
      "Geared bicycle and sanitised helmet",
      "Support vehicle with first-aid & puncture kit",
      "Traditional village breakfast and chai",
      "Ride leader and route marshal"
    ],
    itinerary: [
      "Briefing and bike adjustment at Khadakwasla gate (15 mins)",
      "Scenic 18km ride through rural hamlets (90 mins)",
      "Rustic village breakfast stop at base (45 mins)",
      "Gentle cruise back with lakeside photo stops (90 mins)"
    ],
    cancellationPolicy: "Free cancellation up to 24 hours prior to ride start.",
    host: { name: "City Experiences India", verified: true, responseTime: "within 2 hours" }
  },
  {
    slug: "varanasi-sunrise-boat-and-ghat-walk",
    title: "Varanasi Sunrise Heritage Boat & Ancient Alleyways Walk",
    category: "heritage",
    city: "Varanasi",
    area: "Assi Ghat to Manikarnika",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80",
    price: 1600,
    originalPrice: 2200,
    duration: "3 hours",
    rating: 4.96,
    reviews: 310,
    groupSize: "Up to 8 guests",
    startTimes: ["05:15"],
    language: "English, Hindi",
    difficulty: "Easy",
    highlights: [
      "Silent electric or wooden rowboat across 84 mystic ghats at dawn",
      "Subah-e-Banaras morning chanting and flute recital at Assi",
      "Private guided walk through hidden 500-year-old silk weaver lanes",
      "Hot authentic Banarasi malaiyo / kachori-jalebi breakfast tasting"
    ],
    included: [
      "Private rowboat with verified licensed boatman",
      "Historian guide and native storyteller",
      "Morning heritage breakfast and kulhad chai",
      "Temple entry facilitation"
    ],
    itinerary: [
      "Dawn gathering at Assi Ghat for sunrise rituals (30 mins)",
      "Boat journey cruising down to Manikarnika (75 mins)",
      "Disembarkation and walking tour through inner gallis (60 mins)",
      "Traditional Banarasi breakfast celebration (15 mins)"
    ],
    cancellationPolicy: "Free cancellation up to 24 hours before activity.",
    host: { name: "City Experiences India", verified: true, responseTime: "within 15 mins" }
  },
  {
    slug: "jaipur-blue-pottery-workshop",
    title: "Jaipur Traditional Blue Pottery Masterclass",
    category: "culture",
    city: "Jaipur",
    area: "Amer Road",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1000&q=80",
    price: 1350,
    originalPrice: 1800,
    duration: "2.5 hours",
    rating: 4.87,
    reviews: 89,
    groupSize: "Up to 8 guests",
    startTimes: ["11:00", "15:00"],
    language: "English, Hindi",
    difficulty: "Easy",
    highlights: [
      "Hands-on shaping with quartz powder, gum, and fuller's earth",
      "Hand-painting traditional cobalt blue and turquoise botanical motifs",
      "Direct guidance from master artisan families practicing since 19th century",
      "Keep and take home your crafted pottery piece"
    ],
    included: [
      "All raw materials, pigments, brushes, and quartz dough",
      "Studio kiln firing and protective packaging",
      "Masala chai and Rajasthani sweets",
      "Certificate of artisan workshop completion"
    ],
    itinerary: [
      "History and chemistry of quartz-based Blue Pottery (25 mins)",
      "Wheel and mold shaping demonstration (35 mins)",
      "Brushwork and natural oxide pigment painting (60 mins)",
      "Kiln walkthrough and packaging of finished keepsake (30 mins)"
    ],
    cancellationPolicy: "Full refund up to 24 hours prior to workshop.",
    host: { name: "City Experiences India", verified: true, responseTime: "within 45 mins" }
  },
  {
    slug: "mawphlang-sacred-forest-walk",
    title: "Mawphlang Sacred Forest Indigenous Walk & Folklore",
    category: "nature",
    city: "Shillong",
    area: "East Khasi Hills",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
    price: 1500,
    originalPrice: 2000,
    duration: "3 hours",
    rating: 4.93,
    reviews: 114,
    groupSize: "Up to 10 guests",
    startTimes: ["09:00", "13:30"],
    language: "English, Khasi, Hindi",
    difficulty: "Easy",
    highlights: [
      "Enter an ancient grove protected by sacred tribal laws for 800 years",
      "Explore rare medicinal plants, orchids, and monolith coronation sites",
      "Guided by indigenous Khasi community elders",
      "Learn the strict taboos: 'Take nothing out, leave nothing behind'"
    ],
    included: [
      "Forest sanctuary entry fee & tribal council conservation permit",
      "Certified indigenous community guide",
      "Herbal tea tasting and local snacks",
      "Walking sticks and rain gear"
    ],
    itinerary: [
      "Welcome ritual and introduction at Mawphlang heritage village (20 mins)",
      "Canopy walk through old-growth rainforest (90 mins)",
      "Stone altar sites and ancient coronation circle (40 mins)",
      "Community discussion and traditional herbal tea (30 mins)"
    ],
    cancellationPolicy: "Free cancellation up to 24 hours before start time.",
    host: { name: "City Experiences India", verified: true, responseTime: "within an hour" }
  }
]

export function findActivityBySlug(slugOrId: string): Activity | undefined {
  const norm = slugOrId.toLowerCase().trim()
  return activities.find(
    (a) =>
      a.slug === norm ||
      (norm.includes("kayak") && a.slug.includes("kayak")) ||
      (norm.includes("coffee") && a.slug.includes("coffee")) ||
      (norm.includes("cycling") && a.slug.includes("cycling")) ||
      (norm.includes("varanasi") && a.slug.includes("varanasi")) ||
      (norm.includes("pottery") && a.slug.includes("pottery")) ||
      (norm.includes("mawphlang") && a.slug.includes("mawphlang"))
  )
}
