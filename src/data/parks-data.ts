export type ParkFeature =
  | 'shade'
  | 'fenced'
  | 'cafe'
  | 'parking'
  | 'stroller'
  | 'benches'
  | 'quiet'
  | 'large'
  | 'walkway'
  | 'birthday'

export type NearbyCafe = {
  id: string
  placeId?: string
  name: string
  lat: number
  lng: number
  distanceMeters: number
  rating?: number
  reviewCount?: number
  address?: string
  googleMapsUri?: string
  openNow?: boolean
}

export type Park = {
  id: string
  slug: string
  name: string
  city: string
  neighborhood: string
  address: string
  lat: number
  lng: number
  ageRange: string
  ageMin: number
  ageMax: number
  features: ParkFeature[]
  description: string
  coverPhoto: string
  rating: number
  reviewCount: number
  hasShade: boolean
  isFenced: boolean
  hasCafeNearby: boolean
  googlePlaceId?: string
  googleMapsUri?: string
  googleRating?: number
  googleReviewCount?: number
  nearbyCafes?: NearbyCafe[]
  nearestCafeName?: string
  nearestCafeDistanceMeters?: number
}

export const parkFeatureLabels: Record<ParkFeature, string> = {
  shade: 'Ima hlad',
  fenced: 'Ogradeno',
  cafe: 'Kafic blizu',
  parking: 'Parking',
  stroller: 'Kolica',
  benches: 'Klupe',
  quiet: 'Mirnije',
  large: 'Veliko igraliste',
  walkway: 'Setnica',
  birthday: 'Za rodendan',
}

export const parks: Park[] = [
  {
    id: 'maksimirsko-igraliste',
    slug: 'maksimirsko-igraliste',
    name: 'Maksimirsko igraliste',
    city: 'Zagreb',
    neighborhood: 'Maksimir',
    address: 'Maksimirski perivoj, 10000 Zagreb',
    lat: 45.8312,
    lng: 16.0184,
    ageRange: '0-6',
    ageMin: 0,
    ageMax: 6,
    features: ['shade', 'fenced', 'cafe', 'stroller', 'benches', 'quiet'],
    description: 'Mirno igraliste u zelenilu Maksimira, dobro za najmlade i kratki obiteljski izlazak uz setnju parkom.',
    coverPhoto: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=900&q=80',
    rating: 4.7,
    reviewCount: 96,
    hasShade: true,
    isFenced: true,
    hasCafeNearby: true,
    googleMapsUri: 'https://www.google.com/maps/search/?api=1&query=Maksimir%20playground%20Zagreb',
    nearbyCafes: [
      {
        id: 'kavana-maksimir',
        name: 'Kavana Maksimir',
        lat: 45.8317,
        lng: 16.0197,
        distanceMeters: 180,
        rating: 4.4,
        reviewCount: 420,
        address: 'Maksimirski perivoj',
      },
      {
        id: 'vidikovac-maksimir',
        name: 'Vidikovac Maksimir',
        lat: 45.8323,
        lng: 16.0218,
        distanceMeters: 290,
        rating: 4.3,
        reviewCount: 310,
      },
    ],
    nearestCafeName: 'Kavana Maksimir',
    nearestCafeDistanceMeters: 180,
  },
  {
    id: 'park-bundek',
    slug: 'park-bundek',
    name: 'Park Bundek',
    city: 'Zagreb',
    neighborhood: 'Novi Zagreb',
    address: 'Bundek, 10020 Zagreb',
    lat: 45.7848,
    lng: 15.9863,
    ageRange: '3-8',
    ageMin: 3,
    ageMax: 8,
    features: ['shade', 'cafe', 'parking', 'stroller', 'benches', 'large', 'walkway', 'birthday'],
    description: 'Puno hlada uz jezero, vise igralisnih zona i dovoljno prostora za igru, piknik i duze zadrzavanje.',
    coverPhoto: 'https://images.unsplash.com/photo-1579706783491-08184d1b2f47?auto=format&fit=crop&w=900&q=80',
    rating: 4.8,
    reviewCount: 128,
    hasShade: true,
    isFenced: false,
    hasCafeNearby: true,
    googleMapsUri: 'https://www.google.com/maps/search/?api=1&query=Bundek%20playground%20Zagreb',
    nearbyCafes: [
      {
        id: 'beach-bar-bundek',
        name: 'Beach Bar Bundek',
        lat: 45.7856,
        lng: 15.9878,
        distanceMeters: 160,
        rating: 4.2,
        reviewCount: 260,
      },
      {
        id: 'caffe-bundek',
        name: 'Caffe Bundek',
        lat: 45.7836,
        lng: 15.9842,
        distanceMeters: 240,
        rating: 4.1,
        reviewCount: 180,
      },
    ],
    nearestCafeName: 'Beach Bar Bundek',
    nearestCafeDistanceMeters: 160,
  },
  {
    id: 'jarun-djecji-park',
    slug: 'jarun-djecji-park',
    name: 'Jarun djecji park',
    city: 'Zagreb',
    neighborhood: 'Jarun',
    address: 'Aleja Matije Ljubeka, 10000 Zagreb',
    lat: 45.7837,
    lng: 15.9175,
    ageRange: '6+',
    ageMin: 6,
    ageMax: 12,
    features: ['shade', 'cafe', 'parking', 'large', 'walkway', 'birthday'],
    description: 'Prostrano igraliste uz jezero i setnicu. Dobar izbor za aktivne obitelji, bicikle i dulji boravak.',
    coverPhoto: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=900&q=80',
    rating: 4.6,
    reviewCount: 88,
    hasShade: true,
    isFenced: false,
    hasCafeNearby: true,
    googleMapsUri: 'https://www.google.com/maps/search/?api=1&query=Jarun%20playground%20Zagreb',
    nearbyCafes: [
      {
        id: 'aquarius-caffe',
        name: 'Aquarius Caffe',
        lat: 45.7848,
        lng: 15.9145,
        distanceMeters: 310,
        rating: 4.2,
        reviewCount: 520,
      },
      {
        id: 'jarun-lake-bar',
        name: 'Lake Bar Jarun',
        lat: 45.7822,
        lng: 15.9201,
        distanceMeters: 280,
        rating: 4.0,
        reviewCount: 190,
      },
    ],
    nearestCafeName: 'Lake Bar Jarun',
    nearestCafeDistanceMeters: 280,
  },
  {
    id: 'park-ribnjak',
    slug: 'park-ribnjak',
    name: 'Park Ribnjak',
    city: 'Zagreb',
    neighborhood: 'Centar',
    address: 'Ribnjak, 10000 Zagreb',
    lat: 45.8169,
    lng: 15.9795,
    ageRange: '0-8',
    ageMin: 0,
    ageMax: 8,
    features: ['shade', 'fenced', 'cafe', 'stroller', 'benches', 'quiet'],
    description: 'Centralni park s puno zelenila i mirnijim igralistem, praktican za roditelje koji trebaju predah u centru.',
    coverPhoto: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=900&q=80',
    rating: 4.5,
    reviewCount: 74,
    hasShade: true,
    isFenced: true,
    hasCafeNearby: true,
    googleMapsUri: 'https://www.google.com/maps/search/?api=1&query=Park%20Ribnjak%20playground%20Zagreb',
    nearbyCafes: [
      {
        id: 'program-bar',
        name: 'Program Bar',
        lat: 45.8177,
        lng: 15.9806,
        distanceMeters: 170,
        rating: 4.6,
        reviewCount: 680,
      },
    ],
    nearestCafeName: 'Program Bar',
    nearestCafeDistanceMeters: 170,
  },
  {
    id: 'park-zrinjevac',
    slug: 'park-zrinjevac',
    name: 'Park Zrinjevac',
    city: 'Zagreb',
    neighborhood: 'Centar',
    address: 'Trg Nikole Subica Zrinskog, 10000 Zagreb',
    lat: 45.8107,
    lng: 15.978,
    ageRange: '3-6',
    ageMin: 3,
    ageMax: 6,
    features: ['shade', 'cafe', 'stroller', 'benches', 'walkway'],
    description: 'Ureden gradski park za kratku igru i setnju, s puno klupa i kavanama u neposrednoj blizini.',
    coverPhoto: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    rating: 4.4,
    reviewCount: 112,
    hasShade: true,
    isFenced: false,
    hasCafeNearby: true,
    googleMapsUri: 'https://www.google.com/maps/search/?api=1&query=Zrinjevac%20playground%20Zagreb',
    nearbyCafes: [
      {
        id: 'caffe-u-dvoristu',
        name: 'Caffe u Dvoristu',
        lat: 45.8115,
        lng: 15.9793,
        distanceMeters: 210,
        rating: 4.5,
        reviewCount: 540,
      },
      {
        id: 'korica-zrinjevac',
        name: 'Korica',
        lat: 45.8113,
        lng: 15.9762,
        distanceMeters: 190,
        rating: 4.6,
        reviewCount: 390,
      },
    ],
    nearestCafeName: 'Korica',
    nearestCafeDistanceMeters: 190,
  },
  {
    id: 'park-stara-tresnjevka',
    slug: 'park-stara-tresnjevka',
    name: 'Park Stara Tresnjevka',
    city: 'Zagreb',
    neighborhood: 'Tresnjevka',
    address: 'Park Stara Tresnjevka, 10000 Zagreb',
    lat: 45.8017,
    lng: 15.9483,
    ageRange: '0-6',
    ageMin: 0,
    ageMax: 6,
    features: ['shade', 'fenced', 'cafe', 'stroller', 'benches', 'quiet'],
    description: 'Kvartovsko igraliste s ugodnom hladovinom, klupama i dobrim pregledom prostora za roditelje.',
    coverPhoto: 'https://images.unsplash.com/photo-1628592102751-ba83b0314276?auto=format&fit=crop&w=900&q=80',
    rating: 4.6,
    reviewCount: 62,
    hasShade: true,
    isFenced: true,
    hasCafeNearby: true,
    googleMapsUri: 'https://www.google.com/maps/search/?api=1&query=Park%20Stara%20Tresnjevka%20Zagreb',
    nearbyCafes: [
      {
        id: 'leggero-tresnjevka',
        name: 'Leggiero Tresnjevka',
        lat: 45.8024,
        lng: 15.9466,
        distanceMeters: 210,
        rating: 4.3,
        reviewCount: 350,
      },
    ],
    nearestCafeName: 'Leggiero Tresnjevka',
    nearestCafeDistanceMeters: 210,
  },
  {
    id: 'park-dugave',
    slug: 'park-dugave',
    name: 'Park Dugave',
    city: 'Zagreb',
    neighborhood: 'Novi Zagreb',
    address: 'Dugave, 10010 Zagreb',
    lat: 45.7598,
    lng: 15.9996,
    ageRange: '3-10',
    ageMin: 3,
    ageMax: 10,
    features: ['shade', 'fenced', 'parking', 'stroller', 'benches', 'large', 'quiet'],
    description: 'Veliko kvartovsko igraliste s mirnijim ritmom, puno prostora i dobrim pristupom za kolica.',
    coverPhoto: 'https://images.unsplash.com/photo-1616680214084-22670de1bc82?auto=format&fit=crop&w=900&q=80',
    rating: 4.3,
    reviewCount: 49,
    hasShade: true,
    isFenced: true,
    hasCafeNearby: false,
    googleMapsUri: 'https://www.google.com/maps/search/?api=1&query=Park%20Dugave%20Zagreb',
    nearbyCafes: [],
  },
  {
    id: 'park-kajzerica',
    slug: 'park-kajzerica',
    name: 'Park Kajzerica',
    city: 'Zagreb',
    neighborhood: 'Novi Zagreb',
    address: 'Kajzerica, 10020 Zagreb',
    lat: 45.7842,
    lng: 15.9667,
    ageRange: '3-8',
    ageMin: 3,
    ageMax: 8,
    features: ['fenced', 'cafe', 'parking', 'stroller', 'benches', 'birthday'],
    description: 'Prakticno naseljsko igraliste blizu kave i parkinga, dobro za kracu igru nakon vrtica ili vikendom.',
    coverPhoto: 'https://images.unsplash.com/photo-1563299796-17596ed6b017?auto=format&fit=crop&w=900&q=80',
    rating: 4.4,
    reviewCount: 55,
    hasShade: false,
    isFenced: true,
    hasCafeNearby: true,
    googleMapsUri: 'https://www.google.com/maps/search/?api=1&query=Park%20Kajzerica%20Zagreb',
    nearbyCafes: [
      {
        id: 'kajzerica-caffe',
        name: 'Kajzerica Caffe',
        lat: 45.7851,
        lng: 15.9656,
        distanceMeters: 150,
        rating: 4.1,
        reviewCount: 120,
      },
    ],
    nearestCafeName: 'Kajzerica Caffe',
    nearestCafeDistanceMeters: 150,
  },
]
