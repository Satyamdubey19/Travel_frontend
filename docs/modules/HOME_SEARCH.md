# Home And Search Module

## Purpose

The home/search module handles public discovery, homepage sections, search UI, date/location controls, and location detection.

## Source Files

```text
app/page.tsx
components/HomePage.tsx
components/sections/*
components/search/*
lib/homeData.ts
types/search.ts
types/sections.ts
```

## Home Page Flow

```text
/ app/page.tsx
  -> HomePage
  -> HeroSection
  -> PopularDestinations
  -> TourPackages
  -> HomeFeaturedTours
  -> PopularTourPackages
  -> LocationStories
  -> BlogSection
  -> TestimonialsSection
  -> NewsletterSection
```

## Search Flow

```text
SearchBar
  -> LocationInput
  -> DatePicker
  -> LocationDetector
  -> target listing route or query state
```

## Location Detection

```text
read cached userLocation
  -> if fresh, show cached city
  -> try browser navigator.geolocation
  -> call /api/location/gps?lat=...&lng=...
  -> if GPS fails, call /api/location/ip
  -> store result in localStorage
  -> fallback to India / Current Location
```

## Backend Dependencies

```text
GET /api/location/gps
GET /api/location/ip
GET /api/tour
GET /api/activity
GET /api/rental
```

## Testing Notes

```text
Home renders without backend for static sections where possible.
Location permission denied should fallback to IP.
Location API failure should show fallback city.
Cached location should be reused.
Search inputs should not break mobile layout.
```
