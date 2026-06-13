export type UserPost = {
  id: string
  username: string
  userImage: string
  description: string
  image: string
  category: "tour" | "activity" | "destination"
  hashtags: string[]
  timestamp: string
  likes: number
}

export const userPosts: UserPost[] = [
  {
    id: "post-1",
    username: "Priya Sharma",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    description: "Just booked the most amazing monsoon getaway at the Himalayan Adventure. The views are absolutely breathtaking. #GetHotels #TravelDiaries #HimalayaAdventure",
    image: "/tour1.jpg",
    category: "tour",
    hashtags: ["#GetHotels", "#TravelDiaries", "#HimalayaAdventure", "#Wanderlust"],
    timestamp: "2 days ago",
    likes: 1250,
  },
  {
    id: "post-2",
    username: "Arjun Patel",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
    description: "Sunset kayaking in Goa was the highlight of my week. #GetHotels #ActivityTravel #GoaDiaries",
    image: "/tour2.jpg",
    category: "activity",
    hashtags: ["#GetHotels", "#ActivityTravel", "#GoaDiaries", "#VitaminSea"],
    timestamp: "3 days ago",
    likes: 2340,
  },
  {
    id: "post-3",
    username: "Sneha Desai",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
    description: "Exploring the backwaters of Kerala with the most helpful tour guide ever. #GetHotels #KeralaBackwaters #TravelBugBit",
    image: "/tour3.jpg",
    category: "tour",
    hashtags: ["#GetHotels", "#KeralaBackwaters", "#TravelBugBit", "#ExploreMore"],
    timestamp: "5 days ago",
    likes: 3120,
  },
  {
    id: "post-4",
    username: "Aisha Malik",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha",
    description: "Discovering hidden temples and local culture in Rajasthan with the best tour group ever. #GetHotels #Rajasthan #CulturalExploration",
    image: "/tour4.jpg",
    category: "destination",
    hashtags: ["#GetHotels", "#Rajasthan", "#CulturalExploration", "#HeritageTravel"],
    timestamp: "1 week ago",
    likes: 3450,
  },
]
