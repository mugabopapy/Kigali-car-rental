/* =========================================================
   CAR RENTAL OF RWANDA — FLEET DATA
   ---------------------------------------------------------
   This is the default fleet shown to every visitor.
   You can edit cars from the Admin Panel (admin.html).
   After editing, use "Download data file" in the admin panel
   and replace this file on your hosting to publish changes.
   ========================================================= */

const DEFAULT_SITE_SETTINGS = {
  businessName: "Car Rental of Rwanda",
  tagline: "Explore the Land of a Thousand Hills in Comfort",
  whatsappNumber: "250783930289",       // bookings go straight to this WhatsApp
  momoNumber: "+250 783930289",         // MTN Mobile Money number shown to clients
  momoDialCode: "*182*1*1*0783930289*AMOUNT#",
  depositPercent: 30,                   // % required upfront to confirm a booking
  usdToRwf: 1450,                       // exchange rate used to show RWF estimates
  email: "bookings@carrentalofrwanda.com",
  address: "KN 5 Rd, Kigali, Rwanda",
};

const DEFAULT_CARS = [
  {
    id: "land-cruiser-v8",
    model: "Toyota Land Cruiser V8",
    type: "Luxury 4x4",
    category: "luxury",
    pricePerDay: 180,
    seats: 7,
    transmission: "Automatic",
    fuel: "Diesel",
    image: "images/land-cruiser-v8.jpg",
    badge: "Most Popular",
    description:
      "The king of African roads. Powerful V8 engine, full-time 4WD, leather interior and serious ground clearance. Perfect for VIP transport, gorilla trekking trips to Volcanoes National Park and long upcountry journeys in total comfort.",
    features: ["4WD", "A/C", "Leather seats", "Bluetooth", "Long-range fuel tank"],
    available: true,
  },
  {
    id: "prado-tx",
    model: "Toyota Land Cruiser Prado TX",
    type: "4x4 SUV",
    category: "suv",
    pricePerDay: 120,
    seats: 7,
    transmission: "Automatic",
    fuel: "Diesel",
    image: "images/prado-tx.jpg",
    badge: "Traveller's Choice",
    description:
      "Rwanda's favourite safari and upcountry SUV. Reliable, comfortable and capable on any road — tarmac, murram or mountain trail. Ideal for families and small groups visiting Akagera, Nyungwe or Lake Kivu.",
    features: ["4WD", "A/C", "7 seats", "Roof rails", "USB charging"],
    available: true,
  },
  {
    id: "rav4",
    model: "Toyota RAV4",
    type: "Compact SUV",
    category: "suv",
    pricePerDay: 60,
    seats: 5,
    transmission: "Automatic",
    fuel: "Petrol",
    image: "images/rav4.jpg",
    badge: "Best Value",
    description:
      "The smart choice for self-drive around Kigali and day trips. Easy to drive, economical on fuel, and raised enough to handle rural roads. Great for couples and solo travellers on a budget.",
    features: ["AWD", "A/C", "Fuel efficient", "Bluetooth", "Reverse camera"],
    available: true,
  },
  {
    id: "corolla",
    model: "Toyota Corolla",
    type: "Sedan",
    category: "sedan",
    pricePerDay: 45,
    seats: 5,
    transmission: "Automatic",
    fuel: "Petrol",
    image: "images/corolla.jpg",
    badge: "",
    description:
      "Clean, comfortable and dependable city car. Perfect for business meetings, airport transfers and getting around Kigali. The most affordable way to have your own wheels in Rwanda.",
    features: ["A/C", "Fuel efficient", "Bluetooth", "Comfortable ride"],
    available: true,
  },
  {
    id: "hiace",
    model: "Toyota Hiace",
    type: "Minivan / Group Van",
    category: "van",
    pricePerDay: 100,
    seats: 14,
    transmission: "Manual",
    fuel: "Diesel",
    image: "images/hiace.jpg",
    badge: "Groups",
    description:
      "Move your whole team, family or tour group together. Up to 14 passengers with luggage space. Comes with an experienced driver — ideal for conferences, weddings, church groups and multi-day tours.",
    features: ["14 seats", "A/C", "Driver included", "Luggage space"],
    available: true,
  },
  {
    id: "hilux",
    model: "Toyota Hilux Double Cab",
    type: "4x4 Pickup",
    category: "pickup",
    pricePerDay: 90,
    seats: 5,
    transmission: "Manual",
    fuel: "Diesel",
    image: "images/hilux.jpg",
    badge: "",
    description:
      "Unstoppable workhorse for projects, NGOs and field work. Double cab for 5 people plus a full cargo bed. Handles construction sites, farms and the roughest rural roads without complaint.",
    features: ["4WD", "Cargo bed", "A/C", "Tow bar", "Heavy duty"],
    available: true,
  },
  {
    id: "mercedes-e-class",
    model: "Mercedes-Benz E-Class",
    type: "Luxury Sedan",
    category: "luxury",
    pricePerDay: 150,
    seats: 5,
    transmission: "Automatic",
    fuel: "Petrol",
    image: "images/mercedes-e-class.jpg",
    badge: "VIP",
    description:
      "Arrive in style. Executive luxury sedan for weddings, diplomatic visits, corporate events and VIP airport pickups. Chauffeur service available on request.",
    features: ["Leather interior", "A/C", "Chauffeur option", "Premium sound"],
    available: true,
  },
  {
    id: "safari-jeep",
    model: "Safari Jeep Wrangler",
    type: "Safari 4x4",
    category: "safari",
    pricePerDay: 130,
    seats: 4,
    transmission: "Manual",
    fuel: "Petrol",
    image: "images/safari-jeep.jpg",
    badge: "Adventure",
    description:
      "Open-air adventure machine built for game drives. Pop-up safari roof for photography, rugged 4x4 drivetrain for Akagera National Park trails. The ultimate way to experience Rwandan wildlife.",
    features: ["4WD", "Safari roof", "Off-road tyres", "Cooler box"],
    available: true,
  },
];

const CAR_CATEGORIES = [
  { id: "all", label: "All Cars" },
  { id: "suv", label: "SUV & 4x4" },
  { id: "sedan", label: "Sedans" },
  { id: "safari", label: "Safari 4x4" },
  { id: "van", label: "Vans & Groups" },
  { id: "pickup", label: "Pickups" },
  { id: "luxury", label: "Luxury & VIP" },
];

/* ---- storage helpers: admin edits override defaults via localStorage ---- */
function loadCars() {
  try {
    const saved = localStorage.getItem("crr_cars");
    if (saved) return JSON.parse(saved);
  } catch (e) { /* corrupted storage — fall back to defaults */ }
  return JSON.parse(JSON.stringify(DEFAULT_CARS));
}

function loadSettings() {
  try {
    const saved = localStorage.getItem("crr_settings");
    if (saved) return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(saved) };
  } catch (e) { /* corrupted storage — fall back to defaults */ }
  return { ...DEFAULT_SITE_SETTINGS };
}
