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

/** coverPhoto: Wikimedia Commons (CC) — vidi tools/fetch-park-photos.mjs */

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
  photos?: string[]
  rating: number
  reviewCount: number
  hasShade: boolean
  isFenced: boolean
  hasCafeNearby: boolean
  googlePlaceId?: string
  googleMapsUri?: string
  googleRating?: number
  googleReviewCount?: number
  skipGooglePlaces?: boolean
  nearbyCafes?: NearbyCafe[]
  nearestCafeName?: string
  nearestCafeDistanceMeters?: number
}

export const parkFeatureLabels: Record<ParkFeature, string> = {
  shade: 'Ima hlad',
  fenced: 'Ograđeno',
  cafe: 'Kafić u blizini',
  parking: 'Parking',
  stroller: 'Kolica',
  benches: 'Klupe',
  quiet: 'Mirnije',
  large: 'Veliko igralište',
  walkway: 'Šetnica',
  birthday: 'Za rođendan',
}

export const parks: Park[] = [
  {
    id: 'maksimirsko-igraliste',
    slug: 'maksimirsko-igraliste',
    name: 'Maksimirsko igralište',
    city: 'Zagreb',
    neighborhood: 'Maksimir',
    address: 'Maksimirski perivoj, 10000 Zagreb',
    lat: 45.8312,
    lng: 16.0184,
    ageRange: '0-6',
    ageMin: 0,
    ageMax: 6,
    features: ['shade', 'fenced', 'cafe', 'stroller', 'benches', 'quiet'],
    description: 'Mirno igralište u zelenilu Maksimira, dobro za najmlađe i kratki obiteljski izlazak uz šetnju parkom.',
    coverPhoto:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Zagreb_-_Maksimirski_perivoj_u_travnju.JPG/1280px-Zagreb_-_Maksimirski_perivoj_u_travnju.JPG',
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
    description: 'Puno hlada uz jezero, više igrališnih zona i dovoljno prostora za igru, piknik i duže zadržavanje.',
    coverPhoto:
      'https://upload.wikimedia.org/wikipedia/commons/9/99/Bundek_climbing_frame_20150307_DSC_0109%2C_crop.jpg',
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
    name: 'Jarun dječji park',
    city: 'Zagreb',
    neighborhood: 'Jarun',
    address: 'Aleja Matije Ljubeka, 10000 Zagreb',
    lat: 45.7837,
    lng: 15.9175,
    ageRange: '6+',
    ageMin: 6,
    ageMax: 12,
    features: ['shade', 'cafe', 'parking', 'large', 'walkway', 'birthday'],
    description: 'Prostrano igralište uz jezero i šetnicu. Dobar izbor za aktivne obitelji, bicikle i dulji boravak.',
    coverPhoto:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Zagreb_Jarun_main_way_1.jpg/1280px-Zagreb_Jarun_main_way_1.jpg',
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
    id: 'park-gajevo-kod-hotela-jarun',
    slug: 'park-gajevo-kod-hotela-jarun',
    name: 'Park Gajevo - kod Hotela Jarun',
    city: 'Zagreb',
    neighborhood: 'Gajevo',
    address: 'Hrgovići 7, 10000 Zagreb',
    lat: 45.7914424,
    lng: 15.9299765,
    ageRange: '3-10',
    ageMin: 3,
    ageMax: 10,
    features: ['shade', 'fenced', 'parking', 'stroller', 'benches', 'large', 'quiet'],
    description: 'Kvartovski dječji park u Gajevu, blizu Hotela Jarun, s više sprava i dovoljno prostora za mirniju igru u zapadnom dijelu Zagreba.',
    coverPhoto: '/parks/Park%20Gajevo%20-%20kod%20Hotela%20Jarun/air.png',
    photos: [
      '/parks/Park%20Gajevo%20-%20kod%20Hotela%20Jarun/air.png',
      '/parks/Park%20Gajevo%20-%20kod%20Hotela%20Jarun/sve_sprave.png',
    ],
    rating: 4.6,
    reviewCount: 0,
    hasShade: true,
    isFenced: true,
    hasCafeNearby: false,
    googleMapsUri:
      'https://www.google.com/maps/place/Park+%22kod+Hotela%22/@45.7915825,15.9302124,20z/data=!4m15!1m8!3m7!1s0x4765d7d42f19ba6d:0xe334713d1fe71783!2sPark+%22kod+Hotela%22!8m2!3d45.7914424!4d15.9299765!10e5!16s%2Fg%2F11r9fb1csc!3m5!1s0x4765d7d42f19ba6d:0xe334713d1fe71783!8m2!3d45.7914424!4d15.9299765!16s%2Fg%2F11r9fb1csc?authuser=0&entry=ttu&g_ep=EgoyMDI2MDUyMC4wIKXMDSoASAFQAw%3D%3D',
    skipGooglePlaces: true,
    nearbyCafes: [],
  },
  {
    id: 'park-gajevo-kod-pbz',
    slug: 'park-gajevo-kod-pbz',
    name: 'Park Gajevo - Kod PBZ',
    city: 'Zagreb',
    neighborhood: 'Gajevo',
    address: 'Gajevo, 10000 Zagreb',
    lat: 45.7888565,
    lng: 15.9317713,
    ageRange: '3-12',
    ageMin: 3,
    ageMax: 12,
    features: ['cafe', 'parking', 'stroller', 'benches', 'large', 'walkway', 'birthday'],
    description:
      'Jedan od najboljih i najvećih dječjih parkova u Gajevu, s puno prostora za igru i više zona za djecu. Veliki plus je kafić Sidro koji je doslovno u sklopu parka, pa roditelji mogu predahnuti dok su djeca na igralištu.',
    coverPhoto: '/parks/Park%20Gajevo%20-%20Kod%20PBZ-a/air.png',
    photos: ['/parks/Park%20Gajevo%20-%20Kod%20PBZ-a/air.png'],
    rating: 4.7,
    reviewCount: 0,
    hasShade: false,
    isFenced: false,
    hasCafeNearby: true,
    googleMapsUri:
      'https://www.google.com/maps/dir/45.790839,15.9340417/45.7888565,15.9317713/@45.7890116,15.9312322,157m/data=!3m1!1e3!4m5!4m4!1m1!4e1!1m0!3e3?authuser=0&entry=ttu&g_ep=EgoyMDI2MDUyMC4wIKXMDSoASAFQAw%3D%3D',
    skipGooglePlaces: true,
    nearbyCafes: [
      {
        id: 'sidro-gajevo',
        name: 'Sidro',
        lat: 45.790839,
        lng: 15.9340417,
        distanceMeters: 260,
        googleMapsUri: 'https://maps.app.goo.gl/Lhr51ApKRTR9R9896',
      },
    ],
    nearestCafeName: 'Sidro',
    nearestCafeDistanceMeters: 260,
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
    description: 'Centralni park s puno zelenila i mirnijim igralištem, praktičan za roditelje koji trebaju predah u centru.',
    coverPhoto:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/ZagrebParkRibnjak.jpg/1280px-ZagrebParkRibnjak.jpg',
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
    address: 'Trg Nikole Šubića Zrinskog, 10000 Zagreb',
    lat: 45.8107,
    lng: 15.978,
    ageRange: '3-6',
    ageMin: 3,
    ageMax: 6,
    features: ['shade', 'cafe', 'stroller', 'benches', 'walkway'],
    description: 'Uređen gradski park za kratku igru i šetnju, s puno klupa i kavanama u neposrednoj blizini.',
    coverPhoto:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Zrinjevac_Park_in_Zagreb%2C_Croatia.JPG/1280px-Zrinjevac_Park_in_Zagreb%2C_Croatia.JPG',
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
    name: 'Park Stara Trešnjevka',
    city: 'Zagreb',
    neighborhood: 'Trešnjevka',
    address: 'Park Stara Trešnjevka, 10000 Zagreb',
    lat: 45.8017,
    lng: 15.9483,
    ageRange: '0-6',
    ageMin: 0,
    ageMax: 6,
    features: ['shade', 'fenced', 'cafe', 'stroller', 'benches', 'quiet'],
    description: 'Kvartovsko igralište s ugodnom hladovinom, klupama i dobrim pregledom prostora za roditelje.',
    coverPhoto:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Zagreb_STC_MeetUp_9_Photo_1.jpg/1280px-Zagreb_STC_MeetUp_9_Photo_1.jpg',
    rating: 4.6,
    reviewCount: 62,
    hasShade: true,
    isFenced: true,
    hasCafeNearby: true,
    googleMapsUri: 'https://www.google.com/maps/search/?api=1&query=Park%20Stara%20Tre%C5%A1njevka%20Zagreb',
    nearbyCafes: [
      {
        id: 'leggero-tresnjevka',
        name: 'Leggiero Trešnjevka',
        lat: 45.8024,
        lng: 15.9466,
        distanceMeters: 210,
        rating: 4.3,
        reviewCount: 350,
      },
    ],
    nearestCafeName: 'Leggiero Trešnjevka',
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
    description: 'Veliko kvartovsko igralište s mirnijim ritmom, puno prostora i dobrim pristupom za kolica.',
    coverPhoto:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Dugave_park_20110917_3137.jpg/1280px-Dugave_park_20110917_3137.jpg',
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
    description: 'Praktično naseljsko igralište blizu kave i parkinga, dobro za kraću igru nakon vrtića ili vikendom.',
    coverPhoto:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Kajzerica_table%2C_Novi_Zagreb.jpg/1280px-Kajzerica_table%2C_Novi_Zagreb.jpg',
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
