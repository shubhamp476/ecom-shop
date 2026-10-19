export interface Product {
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  category: string;
  categorySlug: string;
  image: string;
  gallery: string[];
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  tag?: string;
  description: string;
  specs: { label: string; value: string }[];
}

export interface Category {
  name: string;
  slug: string;
  count: string;
  image: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    name: "Smartphones",
    slug: "smartphones",
    count: "04 items",
    image: "/assets/69d13b078880cdeb9b2b2fc9_2.avif",
    description: "Cutting-edge mobile devices featuring stunning OLED displays, pro-grade camera systems, and all-day battery life.",
  },
  {
    name: "Laptops",
    slug: "laptops",
    count: "04 items",
    image: "/assets/69d13b3baa611e87c5b41017_10.avif",
    description: "Ultra-portable and high-performance laptops designed for creative workflows, business productivity, and intense workloads.",
  },
  {
    name: "Smart Home",
    slug: "smart-home",
    count: "04 items",
    image: "/assets/69d13b8f42315ec1258d8c0a_7.avif",
    description: "Intelligent automation essentials including connected lighting, smart climate controllers, video doorbells, and secure locks.",
  },
  {
    name: "Audio & Sounds",
    slug: "audio-sounds",
    count: "04 items",
    image: "/assets/69e5d6e34156034a8c64aadd_5.avif",
    description: "Immersive soundbars, premium wireless noise-cancelling headphones, Hi-Fi amplifiers, and portable party speakers.",
  },
  {
    name: "Gaming Gadgets",
    slug: "gaming-gadgets",
    count: "04 items",
    image: "/assets/69e5d6cac651252f78781dce_4.avif",
    description: "Ergonomic battle-station peripherals, tactile mechanical keyboards, high-precision streaming microphones, and cooling pads.",
  },
];

export const PRODUCTS: Product[] = [
  // 1-4: Smartphones
  {
    name: "Galaxy S23 Ultra",
    slug: "galaxy-s23-ultra",
    price: 999.99,
    originalPrice: 1199.99,
    category: "Smartphones",
    categorySlug: "smartphones",
    image: "/assets/69d4a654a45341b80906ff1c_1.avif",
    gallery: [
      "/assets/69d4a654a45341b80906ff1c_1.avif",
      "/assets/69d4a67670a06f616945e1bb_2.avif",
      "/assets/69d4a694071a06418761808b_3.avif",
    ],
    rating: 4.9,
    reviewsCount: 38,
    inStock: true,
    tag: "Flagship",
    description: "The ultimate Android flagship with an embedded S Pen, 200MP camera sensor, snapdragon compute platform, and dynamic 120Hz AMOLED display.",
    specs: [
      { label: "Display", value: "6.8-inch Dynamic AMOLED 2X, 120Hz" },
      { label: "Processor", value: "Snapdragon 8 Gen 2 Mobile Platform" },
      { label: "Camera", value: "200MP Main + 12MP Ultra-Wide + Dual 10MP Tele" },
      { label: "Battery", value: "5,000 mAh with 45W Fast Charging" },
      { label: "Storage", value: "256GB / 512GB / 1TB" },
    ],
  },
  {
    name: "Samsung Galaxy Z Fold 6",
    slug: "samsung-galaxy-z-fold-6",
    price: 1599.99,
    originalPrice: 1799.99,
    category: "Smartphones",
    categorySlug: "smartphones",
    image: "/assets/69d4a67670a06f616945e1bb_2.avif",
    gallery: [
      "/assets/69d4a67670a06f616945e1bb_2.avif",
      "/assets/69d4a654a45341b80906ff1c_1.avif",
    ],
    rating: 4.8,
    reviewsCount: 22,
    inStock: true,
    tag: "Foldable",
    description: "Transform your pocket device into a 7.6-inch tablet powerhouse with ultra-thin glass, IP48 water resistance, and advanced AI multitasking.",
    specs: [
      { label: "Main Screen", value: "7.6-inch QXGA+ Dynamic AMOLED 2X" },
      { label: "Cover Screen", value: "6.3-inch HD+ Dynamic AMOLED 2X" },
      { label: "Hinge", value: "Dual-rail Flex Hinge Armor Aluminum" },
      { label: "RAM", value: "12GB LPDDR5X" },
    ],
  },
  {
    name: "iPhone 15 Plus",
    slug: "iphone-15-plus",
    price: 749.99,
    originalPrice: 899.99,
    category: "Smartphones",
    categorySlug: "smartphones",
    image: "/assets/69d4a694071a06418761808b_3.avif",
    gallery: [
      "/assets/69d4a694071a06418761808b_3.avif",
      "/assets/69d4a6b24e15afac2eded03b_4.avif",
    ],
    rating: 4.9,
    reviewsCount: 45,
    inStock: true,
    tag: "Popular",
    description: "Featuring Dynamic Island, a 48MP main camera with 2x Telephoto, color-infused durable glass, and all-day battery life with USB-C.",
    specs: [
      { label: "Display", value: "6.7-inch Super Retina XDR OLED" },
      { label: "Chip", value: "A16 Bionic with 5-core GPU" },
      { label: "Connector", value: "USB-C with USB 2 support" },
      { label: "Safety", value: "Emergency SOS via satellite & Crash Detection" },
    ],
  },
  {
    name: "iPhone SE 4th Gen",
    slug: "iphone-se-4th-gen",
    price: 499.99,
    category: "Smartphones",
    categorySlug: "smartphones",
    image: "/assets/69d4a6b24e15afac2eded03b_4.avif",
    gallery: [
      "/assets/69d4a6b24e15afac2eded03b_4.avif",
    ],
    rating: 4.7,
    reviewsCount: 19,
    inStock: true,
    tag: "Value",
    description: "Compact form factor packed with modern Apple silicon, all-day battery, Face ID, and advanced computational portrait photography.",
    specs: [
      { label: "Display", value: "6.1-inch OLED Super Retina Display" },
      { label: "Chip", value: "A18 Bionic with Apple Intelligence" },
      { label: "Camera", value: "48MP Fusion Camera" },
      { label: "Biometrics", value: "Face ID TrueDepth Camera" },
    ],
  },

  // 5-8: Laptops
  {
    name: "Ultra-Slim Laptop",
    slug: "ultra-slim-laptop",
    price: 949.99,
    originalPrice: 1099.99,
    category: "Laptops",
    categorySlug: "laptops",
    image: "/assets/69d4a70f3d01366b9a2bda19_1.avif",
    gallery: [
      "/assets/69d4a70f3d01366b9a2bda19_1.avif",
      "/assets/69d0c87ed8ef3466bd9164f9_2.avif",
    ],
    rating: 4.8,
    reviewsCount: 31,
    inStock: true,
    tag: "Ultralight",
    description: "Featherlight unibody chassis weighing just 1.1kg with a bright 14-inch IPS panel, 18-hour battery longevity, and silent fanless cooling.",
    specs: [
      { label: "Weight", value: "1.1 kg (2.4 lbs)" },
      { label: "Processor", value: "Intel Core Ultra 7 155H" },
      { label: "Memory", value: "16GB LPDDR5X 7467MHz" },
      { label: "Storage", value: "512GB PCIe 4.0 NVMe SSD" },
    ],
  },
  {
    name: "2-in-1 Convertible Laptop",
    slug: "2-in-1-convertible-laptop",
    price: 649.99,
    category: "Laptops",
    categorySlug: "laptops",
    image: "/assets/69d0c87ed8ef3466bd9164f9_2.avif",
    gallery: [
      "/assets/69d0c87ed8ef3466bd9164f9_2.avif",
    ],
    rating: 4.6,
    reviewsCount: 14,
    inStock: true,
    tag: "Versatile",
    description: "A 360-degree rotating geared hinge lets you flip effortlessly between high-speed typing, media stand mode, and sketchpad tablet mode.",
    specs: [
      { label: "Display", value: "14-inch FHD+ Touchscreen with Stylus Pen" },
      { label: "Processor", value: "AMD Ryzen 7 7730U" },
      { label: "Hinge", value: "360-degree Precision Tested Alloy" },
      { label: "Battery", value: "Up to 14 Hours Video Playback" },
    ],
  },
  {
    name: "Laptop with Retina",
    slug: "laptop-with-retina",
    price: 1499.99,
    originalPrice: 1699.99,
    category: "Laptops",
    categorySlug: "laptops",
    image: "/assets/69d4a766514e45f3c66b8c46_3.avif",
    gallery: [
      "/assets/69d4a766514e45f3c66b8c46_3.avif",
      "/assets/69d4a78323f32ba59dd0c802_4.avif",
    ],
    rating: 5.0,
    reviewsCount: 52,
    inStock: true,
    tag: "Pro Choice",
    description: "Engineered for studio professionals with Liquid Retina XDR screen, 1,000 nits sustained HDR brightness, and unprecedented hardware rendering speed.",
    specs: [
      { label: "Display", value: "16.2-inch Liquid Retina XDR, ProMotion 120Hz" },
      { label: "Compute", value: "14-core CPU, 30-core GPU, 16-core Neural Engine" },
      { label: "Unified Memory", value: "36GB High-Bandwidth RAM" },
      { label: "Ports", value: "3x Thunderbolt 4, HDMI, SDXC, MagSafe 3" },
    ],
  },
  {
    name: "Multimedia HP Laptop",
    slug: "multimedia-hp-laptop",
    price: 799.99,
    category: "Laptops",
    categorySlug: "laptops",
    image: "/assets/69d4a78323f32ba59dd0c802_4.avif",
    gallery: [
      "/assets/69d4a78323f32ba59dd0c802_4.avif",
    ],
    rating: 4.7,
    reviewsCount: 27,
    inStock: true,
    description: "Dedicated graphics horsepower combined with Bang & Olufsen tuned quad speakers for superior content streaming and casual gaming.",
    specs: [
      { label: "Display", value: "15.6-inch OLED 100% DCI-P3 Color Gamut" },
      { label: "Graphics", value: "NVIDIA GeForce RTX 4050 6GB GDDR6" },
      { label: "Audio", value: "Bang & Olufsen Quad Drivers with Audio Boost" },
    ],
  },

  // 9-12: Smart Home
  {
    name: "Wi-Fi LED Bulb",
    slug: "wi-fi-led-bulb",
    price: 19.99,
    category: "Smart Home",
    categorySlug: "smart-home",
    image: "/assets/69d4a7e02cd6ec3c50aaf09a_1.avif",
    gallery: [
      "/assets/69d4a7e02cd6ec3c50aaf09a_1.avif",
      "/assets/69d4a7c525e2e800fb075ced_2.avif",
    ],
    rating: 4.8,
    reviewsCount: 88,
    inStock: true,
    tag: "Best Seller",
    description: "16 million vibrant RGB colors with seamless Matter, HomeKit, and Alexa compatibility. No hub required.",
    specs: [
      { label: "Brightness", value: "1100 Lumens (75W Equivalent)" },
      { label: "Color Range", value: "2000K – 9000K + Full RGB Spectrum" },
      { label: "Protocol", value: "Thread + Matter over Wi-Fi 2.4GHz" },
    ],
  },
  {
    name: "Thermostat Controller",
    slug: "thermostat-controller",
    price: 89.99,
    category: "Smart Home",
    categorySlug: "smart-home",
    image: "/assets/69d4a7c525e2e800fb075ced_2.avif",
    gallery: [
      "/assets/69d4a7c525e2e800fb075ced_2.avif",
    ],
    rating: 4.9,
    reviewsCount: 34,
    inStock: true,
    tag: "Energy Saver",
    description: "Learns your family's routine to optimize indoor climate and reduce HVAC electricity usage by up to 23% each billing cycle.",
    specs: [
      { label: "Display", value: "2.4-inch Mirrored High-Contrast Glass" },
      { label: "Sensors", value: "Temperature, Humidity, Proximity, Ambient Light" },
      { label: "Compatibility", value: "95% of 24V Heating & Cooling Systems" },
    ],
  },
  {
    name: "Smart Video Doorbell",
    slug: "smart-video-doorbell",
    price: 104.99,
    originalPrice: 129.99,
    category: "Smart Home",
    categorySlug: "smart-home",
    image: "/assets/69d4a80ed530f8cb0d394272_3.avif",
    gallery: [
      "/assets/69d4a80ed530f8cb0d394272_3.avif",
      "/assets/69d4a846104d43b5de13f137_4.avif",
    ],
    rating: 4.8,
    reviewsCount: 41,
    inStock: true,
    tag: "Security",
    description: "2K HDR video with head-to-toe 160-degree viewing angle, color night vision, and two-way audio with active noise cancellation.",
    specs: [
      { label: "Resolution", value: "2K Quad HD (2560 x 1440)" },
      { label: "Field of View", value: "160° Diagonal Head-to-Toe View" },
      { label: "Power", value: "Wired (16-24V AC) or Rechargeable Battery" },
    ],
  },
  {
    name: "Smart Door Lock",
    slug: "smart-door-lock",
    price: 134.99,
    category: "Smart Home",
    categorySlug: "smart-home",
    image: "/assets/69d4a846104d43b5de13f137_4.avif",
    gallery: [
      "/assets/69d4a846104d43b5de13f137_4.avif",
    ],
    rating: 4.7,
    reviewsCount: 29,
    inStock: true,
    description: "Biometric fingerprint recognition in 0.3 seconds, anti-peep keypad, remote unlock via smartphone app, and physical key fallback.",
    specs: [
      { label: "Unlocking Methods", value: "Fingerprint, Passcode, App, NFC, Physical Key" },
      { label: "Security Certification", value: "BHMA Grade 2 Certified Deadbolt" },
      { label: "Battery Life", value: "Up to 12 Months (4x AA Batteries)" },
    ],
  },

  // 13-16: Audio & Sounds
  {
    name: "Bluetooth Speaker",
    slug: "bluetooth-speaker",
    price: 84.99,
    category: "Audio & Sounds",
    categorySlug: "audio-sounds",
    image: "/assets/69d4a88b6ec9fb5582a36aeb_1.avif",
    gallery: [
      "/assets/69d4a88b6ec9fb5582a36aeb_1.avif",
      "/assets/69d4a8eeff34e3f332faf8cc_3.avif",
    ],
    rating: 4.9,
    reviewsCount: 63,
    inStock: true,
    tag: "Top Rated",
    description: "360-degree omnidirectional sound with dual passive radiators for deep bass, IP67 waterproof construction, and 20-hour battery life.",
    specs: [
      { label: "Output", value: "30W RMS Digital Amplifier" },
      { label: "Waterproof Rating", value: "IP67 Submersible (1m for 30 mins)" },
      { label: "Bluetooth", value: "Bluetooth 5.3 with Auracast Broadcast" },
    ],
  },
  {
    name: "HD Smart TV",
    slug: "hd-smart-tv",
    price: 549.99,
    originalPrice: 699.99,
    category: "Audio & Sounds",
    categorySlug: "audio-sounds",
    image: "/assets/69d4a8ad6c05f65114409f9c_2.avif",
    gallery: [
      "/assets/69d4a8ad6c05f65114409f9c_2.avif",
      "/assets/69e5d853770d85e89563d4c4_led.png",
    ],
    rating: 4.8,
    reviewsCount: 76,
    inStock: true,
    tag: "Deal",
    description: "Quantum Dot color technology delivers over a billion shades of vibrant color paired with Dolby Atmos 3D cinematic sound.",
    specs: [
      { label: "Panel", value: "55-inch 4K QLED 120Hz Native Refresh" },
      { label: "HDR", value: "Dolby Vision IQ, HDR10+, HLG" },
      { label: "Sound", value: "Dolby Atmos 2.1 Channel 40W Speakers" },
    ],
  },
  {
    name: "Over-Ear Headphones",
    slug: "over-ear-headphones",
    price: 179.99,
    originalPrice: 229.99,
    category: "Audio & Sounds",
    categorySlug: "audio-sounds",
    image: "/assets/69d4a8eeff34e3f332faf8cc_3.avif",
    gallery: [
      "/assets/69d4a8eeff34e3f332faf8cc_3.avif",
      "/assets/69d0d7e0dea65fbb0819441a_6.avif",
    ],
    rating: 5.0,
    reviewsCount: 94,
    inStock: true,
    tag: "Best Sound",
    description: "Industry-leading active noise cancellation with custom 40mm titanium drivers, plush memory foam earcups, and 40-hour playback.",
    specs: [
      { label: "Drivers", value: "40mm Custom Titanium Diaphragms" },
      { label: "ANC Modes", value: "Adaptive ANC, Transparency, Wind Reduction" },
      { label: "Battery", value: "40 Hours with ANC on, Fast Charge (5 mins = 4 hrs)" },
    ],
  },
  {
    name: "Hi-Fi Stereo Amplifier",
    slug: "hi-fi-stereo-amplifier",
    price: 399.99,
    category: "Audio & Sounds",
    categorySlug: "audio-sounds",
    image: "/assets/69d4a91185021c290c834a0b_4.avif",
    gallery: [
      "/assets/69d4a91185021c290c834a0b_4.avif",
    ],
    rating: 4.9,
    reviewsCount: 16,
    inStock: true,
    tag: "Audiophile",
    description: "Pure analog signal path backed by a toroidal transformer, ESS SABRE ES9018 DAC, and Bluetooth aptX HD lossless streaming.",
    specs: [
      { label: "Power Output", value: "100W per Channel into 8 Ohms" },
      { label: "DAC", value: "ESS SABRE 32-bit/384kHz DSD256" },
      { label: "Inputs", value: "Optical, Coaxial, Phono (MM), USB-B, RCA" },
    ],
  },

  // 17-20: Gaming Gadgets
  {
    name: "Mechanical Keyboard",
    slug: "mechanical-keyboard",
    price: 109.99,
    category: "Gaming Gadgets",
    categorySlug: "gaming-gadgets",
    image: "/assets/69d4a94dcbcca23bde74e4e6_1.avif",
    gallery: [
      "/assets/69d4a94dcbcca23bde74e4e6_1.avif",
      "/assets/69d4a9bcfcffe5bae996557b_4.avif",
    ],
    rating: 4.9,
    reviewsCount: 68,
    inStock: true,
    tag: "Tactile",
    description: "75% compact layout featuring pre-lubed hot-swappable switches, gasket mount acoustic dampening, and South-facing per-key RGB.",
    specs: [
      { label: "Switches", value: "Hot-swappable Gateron Pro Yellow Linear" },
      { label: "Keycaps", value: "Double-shot PBT Cherry Profile" },
      { label: "Connectivity", value: "2.4GHz Wireless, Bluetooth 5.1, USB-C" },
    ],
  },
  {
    name: "Gaming Chair",
    slug: "gaming-chair",
    price: 219.99,
    originalPrice: 259.99,
    category: "Gaming Gadgets",
    categorySlug: "gaming-gadgets",
    image: "/assets/69d4a96fdce0c394ea839ed9_2.avif",
    gallery: [
      "/assets/69d4a96fdce0c394ea839ed9_2.avif",
    ],
    rating: 4.7,
    reviewsCount: 35,
    inStock: true,
    description: "Cold-cure high-density foam padding with 4D multidirectional armrests, full 165-degree backrest recline, and magnetic memory foam head pillow.",
    specs: [
      { label: "Materials", value: "Breathable Prime 2.0 PU Leather" },
      { label: "Weight Capacity", value: "Up to 150 kg (330 lbs)" },
      { label: "Gas Lift", value: "Class 4 Heavy Duty Hydraulic Cylinder" },
    ],
  },
  {
    name: "Laptop Cooling Pad",
    slug: "laptop-cooling-pad",
    price: 34.99,
    category: "Gaming Gadgets",
    categorySlug: "gaming-gadgets",
    image: "/assets/69d4a98a3e5dfb5e699e47b4_3.avif",
    gallery: [
      "/assets/69d4a98a3e5dfb5e699e47b4_3.avif",
    ],
    rating: 4.6,
    reviewsCount: 42,
    inStock: true,
    description: "Dual 140mm silent fans generating 75 CFM airflow to lower CPU/GPU temperatures by up to 12°C during sustained heavy gaming sessions.",
    specs: [
      { label: "Fan Speed", value: "800 – 1400 RPM with Dial Controller" },
      { label: "Noise Level", value: "< 21 dBA Ultra Quiet" },
      { label: "Compatibility", value: "Laptops 13-inch up to 17.3-inch" },
    ],
  },
  {
    name: "Streaming Microphone",
    slug: "streaming-microphone",
    price: 89.99,
    originalPrice: 129.99,
    category: "Gaming Gadgets",
    categorySlug: "gaming-gadgets",
    image: "/assets/69d4a9bcfcffe5bae996557b_4.avif",
    gallery: [
      "/assets/69d4a9bcfcffe5bae996557b_4.avif",
      "/assets/69d4d151f7875f8bf47d1d7d_4.avif",
      "/assets/69d4a94dcbcca23bde74e4e6_1.avif",
    ],
    rating: 4.9,
    reviewsCount: 77,
    inStock: true,
    tag: "Creator Pick",
    description: "Broadcast-grade condenser capsule with cardioid pickup pattern, tap-to-mute sensor with LED status indicator, and internal pop filter.",
    specs: [
      { label: "Capsule", value: "25mm Electret Condenser" },
      { label: "Polar Pattern", value: "Cardioid Directional" },
      { label: "Bit / Sample Rate", value: "24-bit / 96kHz Studio Grade" },
      { label: "Mounting", value: "Built-in Shock Mount + 5/8-inch Boom Thread" },
    ],
  },
];
