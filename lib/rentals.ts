export type RentalType = "car" | "bike";

export type Rental = {
  slug: string;
  type: RentalType;
  title: string;
  brand: string;
  city: string;
  pickupArea: string;
  image: string;
  pricePerDay: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  seats?: number;
  transmission?: "Manual" | "Automatic";
  fuel?: "Petrol" | "Diesel" | "Electric" | "Cng" | "Hybrid";
  engine?: string;
  rangeKm: number;
  totalUnits?: number;
  availableUnits?: number;
  deposit: number;
  cancellation: string;
  features: string[];
  documents: string[];
  vendor: { name: string; responseTime: string; verified: boolean };
};

export type RentalReview = {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  response?: string | null;
  responseAt?: string | null;
  createdAt: string;
  User: { name: string; UserProfile?: { avatarUrl?: string | null } | null };
};

export const rentals: Rental[] = [
  {
    slug: "bangalore-ather-electric-scooter",
    type: "bike",
    title: "Ather 450X Gen 3 Fast-Charging Electric Scooter",
    brand: "Ather",
    city: "Bengaluru",
    pickupArea: "Indiranagar 100ft Road Hub",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80",
    pricePerDay: 750,
    originalPrice: 999,
    rating: 4.88,
    reviews: 64,
    seats: 2,
    transmission: "Automatic",
    fuel: "Electric",
    engine: "6.2 kW Electric Motor (Warp Mode)",
    rangeKm: 110,
    totalUnits: 6,
    availableUnits: 4,
    deposit: 2000,
    cancellation: "Full refund up to 24 hours prior to pickup.",
    features: [
      "Fast charging compatible (Ather Grid access)",
      "Google Maps navigation touchscreen console",
      "Bluetooth smartphone pairing & music controls",
      "Complimentary sanitised helmet included"
    ],
    documents: [
      "Valid Driving License (2-Wheeler)",
      "Original Aadhaar / Voter ID verification at pickup"
    ],
    vendor: { name: "Coastal Rides & City Mobility", responseTime: "within 15 mins", verified: true }
  },
  {
    slug: "udaipur-jeep-compass-premium",
    type: "car",
    title: "Jeep Compass Model S 4x4 Automatic",
    brand: "Jeep",
    city: "Udaipur",
    pickupArea: "Fateh Sagar Road Hub",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80",
    pricePerDay: 4800,
    originalPrice: 5900,
    rating: 4.92,
    reviews: 58,
    seats: 5,
    transmission: "Automatic",
    fuel: "Diesel",
    engine: "2.0L Multijet II Turbo Diesel (170 hp)",
    rangeKm: 750,
    totalUnits: 4,
    availableUnits: 2,
    deposit: 8000,
    cancellation: "Full refund up to 48 hours prior to pickup.",
    features: [
      "Panoramic dual-pane sunroof",
      "Selec-Terrain 4x4 system for rugged mountain terrain",
      "Wireless Apple CarPlay & Android Auto",
      "Comprehensive zero-dep insurance included"
    ],
    documents: [
      "Valid Driving License (Min 2 years driving experience)",
      "Government Photo ID & Security Deposit Card Pre-Auth"
    ],
    vendor: { name: "Coastal Rides & City Mobility", responseTime: "within 30 mins", verified: true }
  },
  {
    slug: "mumbai-kia-seltos-automatic",
    type: "car",
    title: "Kia Seltos GTX+ Turbo Petrol Automatic",
    brand: "Kia",
    city: "Mumbai",
    pickupArea: "Bandra Kurla Complex (BKC) Terminal",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
    pricePerDay: 3500,
    originalPrice: 4200,
    rating: 4.85,
    reviews: 79,
    seats: 5,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "1.5L T-GDi Smartstream (160 hp, 7-DCT)",
    rangeKm: 620,
    totalUnits: 5,
    availableUnits: 3,
    deposit: 6000,
    cancellation: "Full refund up to 24 hours prior to pickup.",
    features: [
      "Dual 10.25-inch panoramic cockpit displays",
      "Ventilated front cooling seats for coastal climate",
      "Bose premium 8-speaker audio system",
      "FasTag electronic toll active on highway corridors"
    ],
    documents: [
      "Valid Driving License",
      "Original Aadhaar / Passport identification"
    ],
    vendor: { name: "Coastal Rides & City Mobility", responseTime: "within 20 mins", verified: true }
  },
  {
    slug: "mahindra-thar-automatic",
    type: "car",
    title: "Mahindra Thar LX 4x4 Convertible Hard Top",
    brand: "Mahindra",
    city: "Goa",
    pickupArea: "Candolim Main Beach Hub",
    image: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1000&q=80",
    pricePerDay: 4200,
    originalPrice: 5000,
    rating: 4.95,
    reviews: 132,
    seats: 4,
    transmission: "Automatic",
    fuel: "Diesel",
    engine: "2.2L mHawk 130 CRDe (4x4 with low range)",
    rangeKm: 600,
    totalUnits: 6,
    availableUnits: 3,
    deposit: 7000,
    cancellation: "Full refund up to 48 hours prior to pickup.",
    features: [
      "True mechanical 4x4 transfer case",
      "Water-resistant interior with drainage plugs",
      "Removable rooftop panels for coastal drives",
      "All-terrain rugged puncture-resistant tires"
    ],
    documents: [
      "Valid 4-Wheeler Driving License",
      "Original Government ID (Aadhaar / Passport)"
    ],
    vendor: { name: "Coastal Rides Goa", responseTime: "within 10 mins", verified: true }
  },
  {
    slug: "royal-enfield-himalayan-450",
    type: "bike",
    title: "Royal Enfield Himalayan 450 Adventure Tourer",
    brand: "Royal Enfield",
    city: "Manali",
    pickupArea: "Mall Road Adventure Depot",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80",
    pricePerDay: 1900,
    originalPrice: 2400,
    rating: 4.94,
    reviews: 189,
    seats: 2,
    transmission: "Manual",
    fuel: "Petrol",
    engine: "452cc Sherpa Liquid-Cooled (40 hp, 6-speed with slipper clutch)",
    rangeKm: 450,
    totalUnits: 10,
    availableUnits: 5,
    deposit: 5000,
    cancellation: "Full refund up to 48 hours prior to ride date.",
    features: [
      "Tripper navigation full TFT screen with Google Maps",
      "Long travel Showa upside-down front suspension",
      "Heavy-duty pannier frame & tail rack mounted",
      "Switchable dual-channel ABS for off-road trails"
    ],
    documents: [
      "Valid Motorcycle Driving License (Geared)",
      "Original Aadhaar / Voter ID"
    ],
    vendor: { name: "North Trails Collective", responseTime: "within 15 mins", verified: true }
  },
  {
    slug: "toyota-innova-crysta",
    type: "car",
    title: "Toyota Innova Crysta 2.4 VX 7-Seater",
    brand: "Toyota",
    city: "Kochi",
    pickupArea: "Nedumbassery Airport Hub",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
    pricePerDay: 3800,
    originalPrice: 4500,
    rating: 4.9,
    reviews: 94,
    seats: 7,
    transmission: "Automatic",
    fuel: "Diesel",
    engine: "2.4L GD Turbo Diesel (Super-reliable touring spec)",
    rangeKm: 780,
    totalUnits: 8,
    availableUnits: 4,
    deposit: 6000,
    cancellation: "Full refund up to 24 hours prior to trip start.",
    features: [
      "Captain executive seats in second row",
      "Triple zone air conditioning for hill climbs",
      "Generous 300L luggage trunk capacity with third row folded",
      "Speed governor compliant with all national park regulations"
    ],
    documents: [
      "Valid Driving License",
      "Original Government Identification"
    ],
    vendor: { name: "Peninsular Luxury Mobility", responseTime: "within 20 mins", verified: true }
  }
];

export function findRentalBySlug(slugOrId: string): Rental | undefined {
  const norm = slugOrId.toLowerCase().trim();
  return rentals.find(
    (r) =>
      r.slug === norm ||
      (norm.includes("ather") && r.slug.includes("ather")) ||
      (norm.includes("compass") && r.slug.includes("compass")) ||
      (norm.includes("seltos") && r.slug.includes("seltos")) ||
      (norm.includes("thar") && r.slug.includes("thar")) ||
      (norm.includes("himalayan") && r.slug.includes("himalayan")) ||
      (norm.includes("innova") && r.slug.includes("innova"))
  );
}
