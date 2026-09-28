import { Auction, Classified, Category, User, Bid } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Scrap Heavy Machinery', slug: 'scrap-heavy-machinery', auctions_count: 5, classifieds_count: 8 },
  { id: 2, name: 'Non-Ferrous Copper & Brass', slug: 'non-ferrous-copper-brass', auctions_count: 4, classifieds_count: 6 },
  { id: 3, name: 'Ferrous Heavy Melting Steel (HMS)', slug: 'ferrous-hms', auctions_count: 6, classifieds_count: 10 },
  { id: 4, name: 'E-Waste & Circuit Boards', slug: 'e-waste-circuit-boards', auctions_count: 3, classifieds_count: 4 },
  { id: 5, name: 'Industrial Boilers & Turbines', slug: 'industrial-boilers-turbines', auctions_count: 2, classifieds_count: 3 },
  { id: 6, name: 'Vehicle Dismantling & Auto Scrap', slug: 'vehicle-dismantling-auto-scrap', auctions_count: 3, classifieds_count: 5 },
];

export const INITIAL_USERS: (User & { password?: string; login_id?: string })[] = [
  {
    id: 3,
    name: 'Master Admin',
    email: 'admin@salvagereef.com',
    login_id: 'SR-ADMIN',
    phone: '9820999999',
    role: 'master_admin',
    company_name: 'SalvageReef Master Operations',
    city: 'Mumbai',
    state: 'Maharashtra',
    is_verified: true,
    is_active: true,
    password: 'sociial123',
  },
  {
    id: 6,
    name: 'SalvageReef Executive Desk Admin',
    email: 'executive@salvagereef.com',
    login_id: 'SR-EXEC-1',
    phone: '9820777777',
    role: 'desk_admin',
    company_name: 'SalvageReef Executive Desk',
    city: 'Mumbai',
    state: 'Maharashtra',
    is_verified: true,
    is_active: true,
    password: 'execadmin123',
  },
  {
    id: 5,
    name: 'SalvageReef Desk Admin (Read-Only)',
    email: 'inspector@salvagereef.com',
    login_id: 'SR-DESK-1',
    phone: '9820888888',
    role: 'read_only_admin',
    company_name: 'SalvageReef Audit Desk (Read-Only)',
    city: 'Mumbai',
    state: 'Maharashtra',
    is_verified: true,
    is_active: true,
    password: 'deskadmin123',
  },
  {
    id: 1,
    name: 'SalvageReef Verified Seller',
    email: 'seller@salvagereef.com',
    login_id: 'SR-SELLER-1',
    phone: '7304481166',
    role: 'agent',
    company_name: 'Apex Scrap Recyclers Ltd',
    city: 'Mumbai',
    state: 'Maharashtra',
    is_verified: true,
    is_active: true,
    password: 'SellerPass@2026',
  },
  {
    id: 4,
    name: 'Rajesh Metals Scrap Trader',
    email: 'rajesh@rajeshmetals.com',
    login_id: 'SR-SELLER-2',
    phone: '9820198201',
    role: 'agent',
    company_name: 'Rajesh Industrial Scrap Traders',
    city: 'Bhayander',
    state: 'Maharashtra',
    is_verified: false,
    is_active: false,
    password: 'Rajesh@2026',
  },
  {
    id: 2,
    name: 'Neelkanth Sharma',
    email: 'bidder@salvagereef.com',
    login_id: 'SR-BIDDER-1',
    phone: '9820123456',
    role: 'bidder',
    company_name: 'Metals & Alloys Co',
    city: 'Mumbai',
    state: 'Maharashtra',
    is_verified: true,
    is_active: true,
    password: 'BidderPass@2026',
  },
];

export const INITIAL_AUCTIONS: Auction[] = [
  {
    id: 999,
    title: '⚡ 2-Minute Express Demo Auction: 15 MT Industrial Copper Scrap',
    slug: '2-minute-express-demo-copper-scrap',
    description: 'Special 2-minute express live auction demo with top 3 bidders (H1, H2, H3). Test winner selection desk in Admin Panel.',
    category_id: 2,
    auction_type: 'public',
    status: 'live',
    quantity: 15,
    unit: 'MT',
    starting_price: 500000,
    current_highest_bid: 750000,
    bid_increment: 10000,
    start_time: new Date(Date.now() - 300000).toISOString(),
    end_time: new Date(Date.now() + 120000).toISOString(), // 2 minutes from now
    location_city: 'Mumbai',
    location_state: 'Maharashtra',
    is_group: false,
    created_by: 1,
    category: { id: 2, name: 'Non-Ferrous Copper & Brass', slug: 'non-ferrous-copper-brass' },
    creator: { id: 1, name: 'SalvageReef Corporate Disposal', email: 'salvagereef@gmail.com', phone: '7304481166', role: 'admin', company_name: 'SalvageReef Operations' },
    images: [
      { id: 99, image_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', is_primary: true }
    ],
    primary_image: { id: 99, image_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', is_primary: true },
    bids: [
      { id: 901, amount: 750000, bidder_name: 'Neelkanth Sharma (H1 Winner)', user: { name: 'Neelkanth Sharma', email: 'neelkanth@metals.com' }, created_at: new Date(Date.now() - 60000).toISOString() },
      { id: 902, amount: 720000, bidder_name: 'Bharat Scrap Traders (H2 Winner)', user: { name: 'Bharat Traders', email: 'procurement@bharatscrap.com' }, created_at: new Date(Date.now() - 120000).toISOString() },
      { id: 903, amount: 690000, bidder_name: 'Western Heavy Recyclers (H3 Winner)', user: { name: 'Western Recyclers', email: 'bids@westernheavy.com' }, created_at: new Date(Date.now() - 180000).toISOString() },
    ],
  },
  {
    id: 101,
    title: '50 MT Industrial Copper Cable Scrap - Grade A Clean Wire',
    slug: '50-mt-industrial-copper-cable-scrap-grade-a',
    description: 'Bulk lot of high-grade copper cables stripped from power sub-station dismantling. Inspection invited at Thane scrap yard. Purity verified at 99.2% Cu. Instant loading assistance available.',
    category_id: 2,
    auction_type: 'public',
    status: 'live',
    quantity: 50,
    unit: 'MT',
    starting_price: 3500000,
    current_highest_bid: 4150000,
    start_time: new Date(Date.now() - 86400000).toISOString(),
    end_time: new Date(Date.now() + 172800000).toISOString(),
    location_city: 'Mumbai',
    location_state: 'Maharashtra',
    is_group: false,
    created_by: 1,
    category: { id: 2, name: 'Non-Ferrous Copper & Brass', slug: 'non-ferrous-copper-brass' },
    creator: { id: 1, name: 'Apex Scrap Recyclers Ltd', email: 'seller@salvagereef.com', phone: '7304481166', role: 'agent', company_name: 'Apex Metals' },
    images: [
      { id: 1, image_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', is_primary: true },
      { id: 2, image_path: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', is_primary: false }
    ],
    primary_image: { id: 1, image_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', is_primary: true },
    bids: [
      { id: 501, amount: 4150000, bidder_name: 'Metals & Alloys Co', user: { name: 'Rajesh Kumar' }, created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 502, amount: 3900000, bidder_name: 'Bharat Scrap Traders', user: { name: 'Bharat Traders' }, created_at: new Date(Date.now() - 7200000).toISOString() },
      { id: 503, amount: 3650000, bidder_name: 'Western Metal Corp', user: { name: 'Western Metal' }, created_at: new Date(Date.now() - 14400000).toISOString() },
    ],
  },
  {
    id: 102,
    title: 'CNC Milling Machine 5-Axis (Industrial Plant Dismantling Surplus)',
    slug: 'cnc-milling-machine-5-axis-surplus-equipment',
    description: 'Heavy duty Japanese manufactured 5-axis CNC Milling machine in prime working condition. Includes original control panel, tool changers, and coolant system. Plant clearance sale.',
    category_id: 1,
    auction_type: 'public',
    status: 'live',
    quantity: 2,
    unit: 'nos',
    starting_price: 8000000,
    current_highest_bid: 9200000,
    start_time: new Date(Date.now() - 172800000).toISOString(),
    end_time: new Date(Date.now() + 86400000).toISOString(),
    location_city: 'Mumbai',
    location_state: 'Maharashtra',
    is_group: false,
    created_by: 1,
    category: { id: 1, name: 'Scrap Heavy Machinery', slug: 'scrap-heavy-machinery' },
    creator: { id: 1, name: 'Apex Scrap Recyclers Ltd', email: 'seller@salvagereef.com', phone: '7304481166', role: 'agent', company_name: 'Apex Metals' },
    images: [
      { id: 3, image_path: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80', is_primary: true },
    ],
    primary_image: { id: 3, image_path: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80', is_primary: true },
    bids: [
      { id: 504, amount: 9200000, bidder_name: 'Precision Engineering Ltd', user: { name: 'Precision Eng' }, created_at: new Date(Date.now() - 5000000).toISOString() },
      { id: 505, amount: 8500000, bidder_name: 'Global Heavy Infra', user: { name: 'Global Heavy' }, created_at: new Date(Date.now() - 10000000).toISOString() },
    ],
  },
  {
    id: 103,
    title: 'Private Corporate Tender: 120 MT Heavy Melting Steel (HMS 1 & 2)',
    slug: 'private-corporate-tender-120-mt-hms-scrap',
    description: 'Confidential private tender for 120 MT HMS scrap generated from chemical plant dismantling near Pune. Corporate buyers must request access to bid.',
    category_id: 3,
    auction_type: 'private',
    status: 'live',
    quantity: 120,
    unit: 'MT',
    starting_price: 4200000,
    current_highest_bid: 4800000,
    start_time: new Date(Date.now() - 43200000).toISOString(),
    end_time: new Date(Date.now() + 259200000).toISOString(),
    location_city: 'Pune',
    location_state: 'Maharashtra',
    is_group: false,
    created_by: 1,
    category: { id: 3, name: 'Ferrous Heavy Melting Steel (HMS)', slug: 'ferrous-hms' },
    creator: { id: 1, name: 'Chemical Infra Disposals', email: 'seller@salvagereef.com', phone: '7304481166', role: 'agent', company_name: 'Chemical Infra' },
    images: [
      { id: 4, image_path: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80', is_primary: true },
    ],
    primary_image: { id: 4, image_path: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80', is_primary: true },
    bids: [],
  },
  {
    id: 104,
    title: 'Group Lot: Textile Plant Dismantling Motors & Boilers Lot',
    slug: 'group-lot-textile-plant-dismantling-motors-boilers',
    description: 'Combined group lot tender comprising 50 heavy electric induction motors and 1 high pressure industrial boiler vessel. Can be bid as a whole lot.',
    category_id: 5,
    auction_type: 'group',
    status: 'live',
    quantity: 1,
    unit: 'Lot',
    starting_price: 1500000,
    current_highest_bid: 1750000,
    start_time: new Date(Date.now() - 20000000).toISOString(),
    end_time: new Date(Date.now() + 180000000).toISOString(),
    location_city: 'Gujarat',
    location_state: 'Gujarat',
    is_group: true,
    created_by: 1,
    category: { id: 5, name: 'Industrial Boilers & Turbines', slug: 'industrial-boilers-turbines' },
    creator: { id: 1, name: 'Gujarat Mills Disposals', email: 'seller@salvagereef.com', phone: '7304481166', role: 'agent', company_name: 'Gujarat Mills' },
    images: [
      { id: 5, image_path: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80', is_primary: true },
    ],
    primary_image: { id: 5, image_path: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80', is_primary: true },
    group_children: [
      { id: 201, title: '50 Units Heavy Duty 15 HP Electric Motors', slug: '50-units-heavy-duty-15-hp-electric-motors', starting_price: 750000, quantity: 50, unit: 'nos', location_city: 'Gujarat', location_state: 'Gujarat', category_id: 1, auction_type: 'public', status: 'live', description: 'Electric motors scrap', created_by: 1 },
      { id: 202, title: 'Industrial Boiler Vessel 10 Ton Steam Capacity', slug: 'industrial-boiler-vessel-10-ton-steam-capacity', starting_price: 1000000, quantity: 1, unit: 'nos', location_city: 'Gujarat', location_state: 'Gujarat', category_id: 5, auction_type: 'public', status: 'live', description: 'High pressure steam boiler vessel', created_by: 1 },
    ],
    bids: [
      { id: 506, amount: 1750000, bidder_name: 'Metals & Alloys Co', user: { name: 'Rajesh Kumar' }, created_at: new Date(Date.now() - 4000000).toISOString() },
    ],
  },
  {
    id: 105,
    title: '15 Tons Electrical Transformer Copper Coil Scrap',
    slug: '15-tons-electrical-transformer-copper-coil-scrap',
    description: 'Upcoming tender for 15 MT oil immersed power transformer core and copper coil scrap from power distribution company.',
    category_id: 2,
    auction_type: 'public',
    status: 'upcoming',
    quantity: 15,
    unit: 'Ton',
    starting_price: 850000,
    current_highest_bid: null,
    start_time: new Date(Date.now() + 86400000).toISOString(),
    end_time: new Date(Date.now() + 345600000).toISOString(),
    location_city: 'Mumbai',
    location_state: 'Maharashtra',
    is_group: false,
    created_by: 1,
    category: { id: 2, name: 'Non-Ferrous Copper & Brass', slug: 'non-ferrous-copper-brass' },
    creator: { id: 1, name: 'Power Grid Salvage Ltd', email: 'seller@salvagereef.com', phone: '7304481166', role: 'agent', company_name: 'Power Grid' },
    images: [
      { id: 6, image_path: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80', is_primary: true },
    ],
    primary_image: { id: 6, image_path: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80', is_primary: true },
    bids: [],
  },
  {
    id: 106,
    title: '25 kW Solar Photovoltaic Panel Scrap & Frame Lot (Demo Item)',
    slug: '25-kw-solar-pv-panel-scrap-demo-item',
    description: 'DEMO ITEM FOR TESTING: High-efficiency monocrystalline solar PV panel salvage lot (25 kW total output) with extruded aluminum mounting structures, DC cabling, and inverter junction boxes. Clean grade A salvage condition suitable for silicon recycling or second-life field deployment.',
    category_id: 4,
    auction_type: 'public',
    status: 'live',
    quantity: 25,
    unit: 'kW',
    starting_price: 450000,
    current_highest_bid: 520000,
    start_time: new Date(Date.now() - 7200000).toISOString(),
    end_time: new Date(Date.now() + 259200000).toISOString(),
    location_city: 'Mumbai',
    location_state: 'Maharashtra',
    is_group: false,
    created_by: 1,
    category: { id: 4, name: 'E-Waste & Circuit Boards', slug: 'e-waste-circuit-boards' },
    creator: { id: 1, name: 'Apex Scrap Recyclers Ltd', email: 'seller@salvagereef.com', phone: '7304481166', role: 'agent', company_name: 'Apex Metals' },
    images: [
      { id: 1061, image_path: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80', is_primary: true },
      { id: 1062, image_path: 'https://images.unsplash.com/photo-1508873696983-2df515122519?w=800&auto=format&fit=crop&q=80', is_primary: false },
    ],
    primary_image: { id: 1061, image_path: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80', is_primary: true },
    bids: [
      { id: 507, amount: 520000, bidder_name: 'EcoGreen Solar Recyclers', user: { name: 'EcoGreen Recyclers' }, created_at: new Date(Date.now() - 1800000).toISOString() },
      { id: 508, amount: 480000, bidder_name: 'SunPower Salvage Ltd', user: { name: 'SunPower Salvage' }, created_at: new Date(Date.now() - 3600000).toISOString() },
    ],
  },
  {
    id: 107,
    title: '🔥 5-Minute Flash Auction: 100 kg High-Purity Copper Armature Scrap',
    slug: '5-minute-flash-auction-100-kg-copper-armature-scrap',
    description: '⚡ LIVE 5-MINUTE FLASH AUCTION DEMO: Premium 100 kg lot of heavy 99.9% pure copper motor armature windings & bare wire scrap. Auction closes in exactly 5 minutes! Place your bids fast!',
    category_id: 2,
    auction_type: 'public',
    status: 'live',
    quantity: 100,
    unit: 'kg',
    starting_price: 75000,
    current_highest_bid: 82000,
    start_time: new Date(Date.now() - 30000).toISOString(),
    end_time: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    location_city: 'Mumbai',
    location_state: 'Maharashtra',
    is_group: false,
    created_by: 1,
    category: { id: 2, name: 'Non-Ferrous Copper & Brass', slug: 'non-ferrous-copper-brass' },
    creator: { id: 1, name: 'Apex Scrap Recyclers Ltd', email: 'seller@salvagereef.com', phone: '7304481166', role: 'agent', company_name: 'Apex Metals' },
    images: [
      { id: 1071, image_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', is_primary: true },
    ],
    primary_image: { id: 1071, image_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', is_primary: true },
    bids: [
      { id: 509, amount: 82000, bidder_name: 'FastMetals India', user: { name: 'FastMetals' }, created_at: new Date(Date.now() - 20000).toISOString() },
      { id: 510, amount: 78000, bidder_name: 'Apex Recyclers Desk', user: { name: 'Apex Recyclers' }, created_at: new Date(Date.now() - 40000).toISOString() },
    ],
  },
  {
    id: 108,
    title: '⚡ High-Voltage Substation Transformer Core Scrap (Demo Auction)',
    slug: 'high-voltage-substation-transformer-core-scrap-demo',
    description: 'DEMO AUCTION ITEM: 40 MT silicon steel laminations & high-voltage copper winding transformer core scrap from power grid substation upgrade. Verified high recovery value lot with complete laboratory assay report.',
    category_id: 1,
    auction_type: 'public',
    status: 'live',
    quantity: 40,
    unit: 'MT',
    starting_price: 1850000,
    current_highest_bid: 2100000,
    start_time: new Date(Date.now() - 3600000 * 4).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 2).toISOString(),
    location_city: 'Navi Mumbai',
    location_state: 'Maharashtra',
    is_group: false,
    created_by: 1,
    category: { id: 1, name: 'Scrap Heavy Machinery', slug: 'scrap-heavy-machinery' },
    creator: { id: 1, name: 'Apex Scrap Recyclers Ltd', email: 'seller@salvagereef.com', phone: '7304481166', role: 'agent', company_name: 'Apex Metals' },
    images: [
      { id: 1081, image_path: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', is_primary: true },
    ],
    primary_image: { id: 1081, image_path: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', is_primary: true },
    bids: [
      { id: 511, amount: 2100000, bidder_name: 'Grid Heavy Recyclers', user: { name: 'Grid Recyclers' }, created_at: new Date(Date.now() - 1800000).toISOString() },
      { id: 512, amount: 1950000, bidder_name: 'Western Metal Corp', user: { name: 'Western Metal' }, created_at: new Date(Date.now() - 5400000).toISOString() },
    ],
  },
];

export const INITIAL_CLASSIFIEDS: Classified[] = [
  {
    id: 301,
    title: 'Heavy Duty Lathe Machine 10 Feet Bed (Running Condition)',
    slug: 'heavy-duty-lathe-machine-10-feet-bed',
    description: '10 feet bed length heavy duty industrial lathe machine. Good spindle precision and motor condition. Available for immediate factory pick up in Thane west industrial zone.',
    category_id: 1,
    price: 185000,
    quantity: 1,
    unit: 'nos',
    location_city: 'Mumbai',
    location_state: 'Maharashtra',
    status: 'available',
    created_by: 1,
    category: { id: 1, name: 'Scrap Heavy Machinery', slug: 'scrap-heavy-machinery' },
    creator: { id: 1, name: 'Ramesh Patel', email: 'ramesh@salvagereef.com', phone: '7304481166', company_name: 'Patel Engineering Scrap' },
    images: [
      { id: 301, image_path: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', is_primary: true },
    ],
    primary_image: { id: 301, image_path: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', is_primary: true },
  },
  {
    id: 302,
    title: 'Mixed Brass Shell & Valve Scrap - 3 Tons Lot',
    slug: 'mixed-brass-shell-valve-scrap-3-tons',
    description: 'Clean sorted brass shell scrap, plumbing valves, and turning chips. Minimum order 1 MT or take complete 3 MT lot. High brass alloy percentage.',
    category_id: 2,
    price: 1250000,
    quantity: 3,
    unit: 'MT',
    location_city: 'Bhiwandi',
    location_state: 'Maharashtra',
    status: 'available',
    created_by: 2,
    category: { id: 2, name: 'Non-Ferrous Copper & Brass', slug: 'non-ferrous-copper-brass' },
    creator: { id: 2, name: 'Rajesh Kumar', email: 'bidder@salvagereef.com', phone: '9820123456', company_name: 'Metals & Alloys Co' },
    images: [
      { id: 302, image_path: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80', is_primary: true },
    ],
    primary_image: { id: 302, image_path: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80', is_primary: true },
  },
  {
    id: 303,
    title: 'Used 50 HP Kirloskar Diesel Generator Set with Acoustic Canopy',
    slug: 'used-50-hp-kirloskar-diesel-generator-set',
    description: '50 HP Silent DG set with Kirloskar engine and Stamford alternator. Self start battery kit included. 1,400 running hours on meter.',
    category_id: 1,
    price: 240000,
    quantity: 1,
    unit: 'nos',
    location_city: 'Pune',
    location_state: 'Maharashtra',
    status: 'available',
    created_by: 1,
    category: { id: 1, name: 'Scrap Heavy Machinery', slug: 'scrap-heavy-machinery' },
    creator: { id: 1, name: 'Suresh Traders', email: 'seller@salvagereef.com', phone: '7304481166', company_name: 'Suresh Machinery Sales' },
    images: [
      { id: 303, image_path: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80', is_primary: true },
    ],
    primary_image: { id: 303, image_path: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80', is_primary: true },
  },
  {
    id: 304,
    title: 'Server Rack E-Waste Scrap Boards & Green Motherboards',
    slug: 'server-rack-e-waste-scrap-boards-bulk-lot',
    description: 'Bulk lot of telecom and server motherboard scrap for gold and precious metal recovery. Gold plated pins intact.',
    category_id: 4,
    price: 95000,
    quantity: 500,
    unit: 'kg',
    location_city: 'Mumbai',
    location_state: 'Maharashtra',
    status: 'available',
    created_by: 1,
    category: { id: 4, name: 'E-Waste & Circuit Boards', slug: 'e-waste-circuit-boards' },
    creator: { id: 1, name: 'Apex Recycling Desk', email: 'seller@salvagereef.com', phone: '7304481166', company_name: 'Apex Recyclers' },
    images: [
      { id: 304, image_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', is_primary: true },
    ],
    primary_image: { id: 304, image_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', is_primary: true },
  },
];

export const INITIAL_INTERESTS = [
  {
    id: 701,
    auction_id: 103,
    user_id: 2,
    message: 'Requesting permission to bid on 120 MT HMS plant scrap. Valid GST and PCB recycling license available.',
    status: 'pending',
    user: { id: 2, name: 'Rajesh Kumar', email: 'bidder@salvagereef.com', company_name: 'Metals & Alloys Co' },
  },
];

export const INITIAL_SELL_SCRAP_REQUESTS = [
  {
    id: 801,
    title: '15 MT Heavy Melting Steel & Motor Scrap Lot',
    category_id: '3',
    category_name: 'Ferrous Heavy Melting Steel (HMS)',
    price: 450000,
    quantity: 15,
    unit: 'MT',
    location_state: 'Maharashtra',
    location_city: 'Mumbai',
    site_address: 'Plot 42, Kolshet Industrial Area, Thane West',
    gst_number: '27AAAAA1234A1Z5',
    seller_name: 'Amit Patel',
    seller_phone: '9820198201',
    seller_email: 'amit@patelscrap.com',
    description: 'Factory clearance HMS 1&2 scrap along with 10 defective electric motors. Inspection invited at site location.',
    image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
    status: 'pending',
    submitted_at: new Date(Date.now() - 86400000).toISOString(),
    user_id: 2,
  },
  {
    id: 802,
    title: '5 Tons Copper Armature Windings & Heavy Cable Scrap',
    category_id: '2',
    category_name: 'Non-Ferrous Copper & Brass',
    price: 3200000,
    quantity: 5,
    unit: 'MT',
    location_state: 'Maharashtra',
    location_city: 'Navi Mumbai',
    site_address: 'Substation Yard 4, Rabale MIDC',
    gst_number: '27BBBBB5678B1Z2',
    seller_name: 'Sanjay Deshmukh',
    seller_phone: '9820771122',
    seller_email: 'sanjay@deshmukhenterprises.com',
    description: 'Purity verified high grade copper scrap from power distribution dismantling. Instant loading available.',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    status: 'pending',
    submitted_at: new Date(Date.now() - 172800000).toISOString(),
    user_id: 1,
  },
];

// Helper functions for persistent LocalStorage DB
const getItem = <T>(key: string, defaultVal: T): T => {
  try {
    if (typeof localStorage === 'undefined') return defaultVal;
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setItem = <T>(key: string, val: T): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
};

const getStoredUser = (defaultVal: any = null): any => {
  try {
    if (typeof localStorage === 'undefined') return defaultVal;
    const userStr = localStorage.getItem('salvagereef_user');
    return userStr ? JSON.parse(userStr) : defaultVal;
  } catch {
    return defaultVal;
  }
};

export const getMockCategories = (): Category[] => getItem('sr_categories', INITIAL_CATEGORIES);
export const getMockAuctions = (): Auction[] => {
  let stored: Auction[];
  const raw = typeof window !== 'undefined' ? localStorage.getItem('sr_auctions') : null;
  if (raw === null) {
    stored = INITIAL_AUCTIONS;
    setItem('sr_auctions', stored);
    setItem('sr_admin_auctions', stored);
  } else {
    try {
      stored = JSON.parse(raw);
      if (!Array.isArray(stored)) stored = INITIAL_AUCTIONS;
    } catch {
      stored = INITIAL_AUCTIONS;
    }
  }
  // Ensure 5-minute flash auction (ID 107) has a active 5-minute timer
  const flashIdx = stored.findIndex((a) => a.id === 107);
  if (flashIdx !== -1) {
    const rawEndTime = stored[flashIdx].end_time;
    const endTimeMs = rawEndTime ? new Date(rawEndTime).getTime() : NaN;
    if (isNaN(endTimeMs) || endTimeMs <= Date.now() || endTimeMs > Date.now() + 5 * 60 * 1000) {
      stored[flashIdx].start_time = new Date(Date.now() - 30000).toISOString();
      stored[flashIdx].end_time = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      stored[flashIdx].status = 'live';
      setItem('sr_auctions', stored);
      setItem('sr_admin_auctions', stored);
    }
  }
  return stored;
};
export const getMockClassifieds = (): Classified[] => {
  const raw = typeof window !== 'undefined' ? localStorage.getItem('sr_classifieds') : null;
  if (raw === null) {
    setItem('sr_classifieds', INITIAL_CLASSIFIEDS);
    setItem('sr_admin_classifieds', INITIAL_CLASSIFIEDS);
    return INITIAL_CLASSIFIEDS;
  }
  try {
    const stored = JSON.parse(raw);
    return Array.isArray(stored) ? stored : INITIAL_CLASSIFIEDS;
  } catch {
    return INITIAL_CLASSIFIEDS;
  }
};
export const getMockInterests = (): any[] => getItem('sr_interests', INITIAL_INTERESTS);
export const getMockSellScrapRequests = (): any[] => getItem('sr_sell_scrap_requests', INITIAL_SELL_SCRAP_REQUESTS);
export const getMockUserBids = (): any[] => getItem('sr_user_bids', [
  {
    id: 901,
    auction_title: '50 MT Industrial Copper Cable Scrap - Grade A Clean Wire',
    auction_slug: '50-mt-industrial-copper-cable-scrap-grade-a',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    bid_amount: 4150000,
    my_status: 'winning',
  },
  {
    id: 902,
    auction_title: 'Group Lot: Textile Plant Dismantling Motors & Boilers Lot',
    auction_slug: 'group-lot-textile-plant-dismantling-motors-boilers',
    created_at: new Date(Date.now() - 4000000).toISOString(),
    bid_amount: 1750000,
    my_status: 'winning',
  },
]);

// Main mock router function
export function handleMockApi(config: any): any {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  let bodyData: any = {};
  if (config.data) {
    try {
      bodyData = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      bodyData = config.data;
    }
  }

  // Parse query parameters
  const queryString = url.includes('?') ? url.split('?')[1] : '';
  const queryParams = new URLSearchParams(queryString);
  if (config.params) {
    Object.keys(config.params).forEach((k) => queryParams.append(k, config.params[k]));
  }

  const cleanUrl = url.split('?')[0].replace(/\/+$/, '');

  // 1. GET /categories
  if (cleanUrl.endsWith('/categories') && method === 'get') {
    return getMockCategories();
  }

  // 2. POST /auctions/:id/bid
  if (cleanUrl.includes('/auctions/') && method === 'post' && cleanUrl.endsWith('/bid')) {
    const parts = cleanUrl.split('/');
    const idIdx = parts.indexOf('auctions') + 1;
    const auctionId = Number(parts[idIdx]);
    const amount = Number(bodyData.amount || 0);

    const auctions = getMockAuctions();
    const aucIndex = auctions.findIndex((a) => a.id === auctionId || a.slug === String(parts[idIdx]));

    const currentUser = JSON.parse(localStorage.getItem('salvagereef_user') || 'null') || INITIAL_USERS[1];

    if (aucIndex !== -1) {
      auctions[aucIndex].current_highest_bid = amount;
      if (!auctions[aucIndex].bids) auctions[aucIndex].bids = [];

      const newBid: Bid = {
        id: Date.now(),
        amount: amount,
        bidder_name: currentUser.company_name || currentUser.name,
        user: { name: currentUser.name },
        created_at: new Date().toISOString(),
      };

      auctions[aucIndex].bids!.unshift(newBid);
      setItem('sr_auctions', auctions);
      setItem('sr_admin_auctions', auctions);

      // Save to user bids
      const userBids = getMockUserBids();
      userBids.unshift({
        id: newBid.id || Date.now(),
        auction_title: auctions[aucIndex].title,
        auction_slug: auctions[aucIndex].slug,
        created_at: newBid.created_at,
        bid_amount: amount,
        my_status: 'winning',
      });
      setItem('sr_user_bids', userBids);

      // Save to admin bids for graph and stats update
      const adminBids = getItem<any[]>('sr_admin_bids', [
        { id: 101, auction_id: 101, auction_title: '50 MT Industrial Copper Cable Scrap', amount: 1450000, bidder_name: 'Neelkanth Sharma', bidder_company: 'Metals & Alloys Co', status: 'approved', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
        { id: 102, auction_id: 101, auction_title: '50 MT Industrial Copper Cable Scrap', amount: 1420000, bidder_name: 'Western Heavy Recyclers', bidder_company: 'Western Recyclers', status: 'approved', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
        { id: 103, auction_id: 102, auction_title: '120 MT HMS 1&2 Heavy Melting Steel Scrap', amount: 4650000, bidder_name: 'Apex Steel Traders', bidder_company: 'Apex Steel Traders', status: 'approved', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
      ]);
      const newAdminBid = {
        id: newBid.id || Date.now(),
        auction_id: auctions[aucIndex].id,
        auction_title: auctions[aucIndex].title,
        amount: amount,
        status: 'pending',
        bidder_name: currentUser.name || 'Registered Bidder',
        bidder_email: currentUser.email || 'bidder@salvagereef.com',
        bidder_company: currentUser.company_name || 'Metals & Scrap Trader',
        created_at: new Date().toISOString(),
      };
      const updatedAdminBids = [newAdminBid, ...adminBids.filter((b: any) => b.id !== newAdminBid.id)];
      setItem('sr_admin_bids', updatedAdminBids);
    }

    return {
      message: 'Bid placed successfully!',
      current_highest_bid: amount,
    };
  }

  // 3. POST /auctions/:id/interest
  if (cleanUrl.includes('/auctions/') && method === 'post' && cleanUrl.endsWith('/interest')) {
    const parts = cleanUrl.split('/');
    const idIdx = parts.indexOf('auctions') + 1;
    const auctionId = Number(parts[idIdx]);

    const currentUser = JSON.parse(localStorage.getItem('salvagereef_user') || 'null') || INITIAL_USERS[1];
    const interests = getMockInterests();

    interests.push({
      id: Date.now(),
      auction_id: auctionId,
      user_id: currentUser.id,
      message: bodyData.message || 'Expressing interest for corporate tender access',
      status: 'pending',
      user: currentUser,
    });

    setItem('sr_interests', interests);
    return { message: 'Interest submitted to admin desk successfully' };
  }

  // 3b. POST /sell-scrap-requests
  if (cleanUrl.endsWith('/sell-scrap-requests') && method === 'post') {
    const requests = getMockSellScrapRequests();
    const currentUser = getStoredUser() || INITIAL_USERS[1];

    const newReq = {
      id: Date.now(),
      title: bodyData.title || 'Scrap Lot Submission',
      category_id: bodyData.category_id || '1',
      category_name: bodyData.category_name || 'General Scrap',
      price: Number(bodyData.price || 0),
      quantity: Number(bodyData.quantity || 1),
      unit: bodyData.unit || 'MT',
      location_state: bodyData.location_state || 'Maharashtra',
      location_city: bodyData.location_city || 'Mumbai',
      site_address: bodyData.site_address || '',
      gst_number: bodyData.gst_number || '',
      seller_name: bodyData.seller_name || currentUser.name,
      seller_phone: bodyData.seller_phone || currentUser.phone,
      seller_email: bodyData.seller_email || currentUser.email,
      description: bodyData.description || '',
      image_url: bodyData.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      status: 'pending',
      submitted_at: new Date().toISOString(),
      user_id: currentUser.id,
    };

    requests.unshift(newReq);
    setItem('sr_sell_scrap_requests', requests);
    return { success: true, message: 'Scrap lot details submitted to Admin Desk successfully', data: newReq };
  }

  // 3c. GET /admin/sell-scrap-requests or GET /sell-scrap-requests
  if ((cleanUrl.endsWith('/sell-scrap-requests') || cleanUrl.endsWith('/admin/sell-scrap-requests')) && method === 'get') {
    const data = getMockSellScrapRequests();
    return { success: true, data, total: data.length };
  }

  // 3d. PUT /admin/sell-scrap-requests/:id/status
  if (cleanUrl.includes('/sell-scrap-requests/') && cleanUrl.endsWith('/status') && method === 'put') {
    const parts = cleanUrl.split('/');
    const reqId = Number(parts[parts.indexOf('sell-scrap-requests') + 1]);
    const requests = getMockSellScrapRequests();
    const idx = requests.findIndex((r: any) => r.id === reqId);
    if (idx !== -1) {
      requests[idx].status = bodyData.status || 'contacted';
      setItem('sr_sell_scrap_requests', requests);
    }
    return { success: true, message: 'Scrap request status updated', data: requests[idx] };
  }

  // 3e. DELETE /admin/sell-scrap-requests/:id
  if (cleanUrl.includes('/sell-scrap-requests/') && method === 'delete') {
    const parts = cleanUrl.split('/');
    const reqId = Number(parts[parts.length - 1]);
    const requests = getMockSellScrapRequests();
    const updated = requests.filter((r: any) => r.id !== reqId);
    setItem('sr_sell_scrap_requests', updated);
    return { success: true, message: 'Scrap request deleted' };
  }

  // 4. GET /auctions/:slug_or_id (Single Auction detail)
  const isSingleAuction = /\/auctions\/[^\/]+$/.test(cleanUrl) && !cleanUrl.endsWith('/auctions');
  if (isSingleAuction && method === 'get') {
    const parts = cleanUrl.split('/');
    const slugOrId = parts[parts.length - 1];

    const auctions = getMockAuctions();
    const auction = auctions.find((a) => a.slug === slugOrId || String(a.id) === slugOrId) || auctions[0];

    const interests = getMockInterests();
    const currentUser = getStoredUser();
    const isApproved = interests.some(
      (i) => i.auction_id === auction.id && i.user_id === currentUser?.id && i.status === 'approved'
    );

    const isUnlocked = auction.auction_type !== 'private' || isApproved || currentUser?.role === 'admin';

    return {
      auction,
      is_unlocked: isUnlocked,
    };
  }

  // 5. GET /auctions (List with filters)
  if (cleanUrl.endsWith('/auctions') && method === 'get') {
    let auctions = getMockAuctions();

    const categoryId = queryParams.get('category_id');
    const auctionType = queryParams.get('auction_type');
    const status = queryParams.get('status');
    const location = queryParams.get('location');
    const search = queryParams.get('search');

    if (categoryId) {
      auctions = auctions.filter((a) => Number(a.category_id) === Number(categoryId));
    }
    if (auctionType) {
      auctions = auctions.filter((a) => a.auction_type === auctionType);
    }
    if (status) {
      auctions = auctions.filter((a) => a.status === status);
    }
    if (location) {
      const locLower = location.toLowerCase();
      auctions = auctions.filter(
        (a) => a.location_city.toLowerCase().includes(locLower) || a.location_state.toLowerCase().includes(locLower)
      );
    }
    if (search) {
      const searchLower = search.toLowerCase();
      auctions = auctions.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          a.description.toLowerCase().includes(searchLower) ||
          String(a.id).includes(searchLower)
      );
    }

    return { data: auctions };
  }

  // 6. POST /classifieds/post-listing
  if (cleanUrl.endsWith('/classifieds/post-listing') && method === 'post') {
    const classifieds = getMockClassifieds();
    const categories = getMockCategories();
    const currentUser = JSON.parse(localStorage.getItem('salvagereef_user') || 'null') || INITIAL_USERS[1];

    const title = bodyData.title || 'Scrap Material Listing';
    const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    const categoryObj = categories.find((c) => c.id === Number(bodyData.category_id)) || categories[0];

    const newClassified: Classified = {
      id: Date.now(),
      title,
      slug: uniqueSlug,
      description: bodyData.description || 'Verified scrap machinery item.',
      category_id: Number(bodyData.category_id || 1),
      price: Number(bodyData.price || 50000),
      quantity: Number(bodyData.quantity || 1),
      unit: bodyData.unit || 'nos',
      location_city: bodyData.location_city || 'Thane',
      location_state: bodyData.location_state || 'Maharashtra',
      status: 'available',
      created_by: currentUser.id,
      category: categoryObj,
      creator: currentUser,
      images: [
        {
          id: Date.now(),
          image_path: bodyData.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
          is_primary: true,
        },
      ],
      primary_image: {
        id: Date.now(),
        image_path: bodyData.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
        is_primary: true,
      },
    };

    classifieds.unshift(newClassified);
    setItem('sr_classifieds', classifieds);
    return newClassified;
  }

  // 7. GET /classifieds/:slug (Single Classified detail)
  const isSingleClassified = /\/classifieds\/[^\/]+$/.test(cleanUrl) && !cleanUrl.endsWith('/classifieds') && !cleanUrl.endsWith('/post-listing');
  if (isSingleClassified && method === 'get') {
    const parts = cleanUrl.split('/');
    const slugOrId = parts[parts.length - 1];

    const classifieds = getMockClassifieds();
    const item = classifieds.find((c) => c.slug === slugOrId || String(c.id) === slugOrId) || classifieds[0];
    return item;
  }

  // 8. GET /classifieds (List with filters)
  if (cleanUrl.endsWith('/classifieds') && method === 'get') {
    let classifieds = getMockClassifieds();

    const categoryId = queryParams.get('category_id');
    const location = queryParams.get('location');
    const search = queryParams.get('search');

    if (categoryId) {
      classifieds = classifieds.filter((c) => Number(c.category_id) === Number(categoryId));
    }
    if (location) {
      const locLower = location.toLowerCase();
      classifieds = classifieds.filter(
        (c) => c.location_city.toLowerCase().includes(locLower) || c.location_state.toLowerCase().includes(locLower)
      );
    }
    if (search) {
      const searchLower = search.toLowerCase();
      classifieds = classifieds.filter(
        (c) =>
          c.title.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower) ||
          String(c.id).includes(searchLower)
      );
    }

    return { data: classifieds };
  }

  // 9. GET /user/dashboard
  if (url.includes('/user/dashboard') && method === 'get') {
    const currentUser = JSON.parse(localStorage.getItem('salvagereef_user') || 'null') || INITIAL_USERS[1];
    const allClassifieds = getMockClassifieds();
    const userListings = allClassifieds.filter((c) => c.created_by === currentUser.id);
    const userBids = getMockUserBids();

    return {
      stats: {
        active_bids: userBids.length,
        auctions_won: 1,
        watchlist_count: 3,
      },
      recent_bids: userBids,
      my_listings: userListings,
    };
  }

  // 10. GET /admin/dashboard/stats
  if (url.includes('/admin/dashboard/stats') && method === 'get') {
    const auctions = getMockAuctions();
    const interests = getMockInterests();

    const needingAttention = auctions.map((auc) => {
      const aucInterests = interests.filter((i) => i.auction_id === auc.id && i.status === 'pending');
      return {
        ...auc,
        interests: aucInterests,
      };
    });

    return {
      stats: {
        total_auctions_live: auctions.filter((a) => a.status === 'live').length,
        total_auctions: auctions.length,
        total_bids_today: 14,
        new_users_this_week: 8,
        pending_approvals: interests.filter((i) => i.status === 'pending').length,
        total_registered_users: INITIAL_USERS.length,
        active_users: INITIAL_USERS.length,
        suspended_users: 0,
        kyc_verified_users: INITIAL_USERS.length,
        total_classifieds: getMockClassifieds().length,
        total_bids: 25,
      },
      needing_attention: needingAttention,
    };
  }

  // 10-analytics. GET /admin/analytics/overview
  if (url.includes('/admin/analytics/overview') && method === 'get') {
    const auctions = getItem<Auction[]>('sr_admin_auctions', getMockAuctions());
    const users = getItem('sr_admin_users', getItem('sr_all_users', INITIAL_USERS));
    const storedBids = getItem('sr_admin_bids', [
      { id: 101, auction_id: 101, auction_title: '50 MT Industrial Copper Cable Scrap', amount: 1450000, bidder_name: 'Neelkanth Sharma', bidder_company: 'Metals & Alloys Co', status: 'approved', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
      { id: 102, auction_id: 101, auction_title: '50 MT Industrial Copper Cable Scrap', amount: 1420000, bidder_name: 'Western Heavy Recyclers', bidder_company: 'Western Recyclers', status: 'approved', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: 103, auction_id: 102, auction_title: '120 MT HMS 1&2 Heavy Melting Steel Scrap', amount: 4650000, bidder_name: 'Apex Steel Traders', bidder_company: 'Apex Steel Traders', status: 'approved', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
      { id: 104, auction_id: 103, auction_title: '35 MT Aluminium Extrusion 6063 Scrap', amount: 820000, bidder_name: 'Neelkanth Sharma', bidder_company: 'Metals & Alloys Co', status: 'approved', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
      { id: 105, auction_id: 104, auction_title: '25 MT Electric Motor Scrap (High Copper)', amount: 1250000, bidder_name: 'Bharat Scrap Traders', bidder_company: 'Bharat Scrap Traders', status: 'approved', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
      { id: 106, auction_id: 105, auction_title: '80 MT Industrial Machinery Dismantling Scrap', amount: 3200000, bidder_name: 'Gujarat Alloys Corp', bidder_company: 'Gujarat Alloys Corp', status: 'approved', created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
      { id: 107, auction_id: 106, auction_title: '15 MT Stainless Steel 304 & 316 Scrap', amount: 980000, bidder_name: 'Neelkanth Sharma', bidder_company: 'Metals & Alloys Co', status: 'approved', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
    ]);

    const totalAuctions = auctions.length;
    const activeAuctions = auctions.filter((a) => a.status === 'live' || a.status === 'upcoming').length;
    const completedAuctions = auctions.filter((a) => (a.status as string) === 'completed' || a.status === 'closed' || a.winner_confirmed).length;
    const totalUsers = users.length;
    const totalBids = storedBids.length;
    const totalAuctionValue = auctions.reduce((acc, a) => acc + (a.current_highest_bid || a.starting_price || 0), 0);

    // Dynamic Bidding Activity series based on requested range
    const selectedRange = queryParams.get('range') || '30d';
    const daysToShow = selectedRange === '7d' ? 7 : selectedRange === '30d' ? 14 : selectedRange === '3m' ? 30 : 14;
    const activityMap: Record<string, { count: number; total: number }> = {};
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateKey = d.toISOString().split('T')[0];
      activityMap[dateKey] = { count: 0, total: 0 };
    }
    storedBids.forEach((b: any) => {
      const dateKey = (b.created_at || new Date().toISOString()).split('T')[0];
      if (activityMap[dateKey]) {
        activityMap[dateKey].count += 1;
        activityMap[dateKey].total += Number(b.amount) || 0;
      }
    });
    const biddingActivity = Object.keys(activityMap)
      .sort()
      .map((k) => ({
        bid_date: k,
        bids_count: activityMap[k].count,
        total_amount: activityMap[k].total,
      }));

    // Auction performance by period
    const auctionPerformance = [
      { period: 'May 2026', total_auctions: 4, completed_auctions: 3, active_auctions: 1 },
      { period: 'Jun 2026', total_auctions: 6, completed_auctions: 5, active_auctions: 1 },
      { period: 'Jul 2026', total_auctions: 7, completed_auctions: 6, active_auctions: 1 },
      { period: 'Aug 2026', total_auctions: totalAuctions, completed_auctions: completedAuctions, active_auctions: activeAuctions },
    ];

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    auctions.forEach((a) => {
      const st = (a.status || 'live').toLowerCase();
      const label = st === 'live' ? 'Live Bidding' : st === 'upcoming' ? 'Upcoming' : st === 'completed' || st === 'closed' ? 'Completed' : 'Draft / Review';
      statusCounts[label] = (statusCounts[label] || 0) + 1;
    });
    const auctionStatus = Object.keys(statusCounts).map((k) => ({
      status: k,
      count: statusCounts[k],
    }));

    // Category performance
    const catMap: Record<string, { name: string; count: number; total: number }> = {};
    auctions.forEach((a) => {
      const catName = typeof a.category === 'object' ? a.category?.name : (a.category || 'Industrial Metals');
      if (!catMap[catName]) catMap[catName] = { name: catName, count: 0, total: 0 };
      catMap[catName].count += 1;
      catMap[catName].total += Number(a.current_highest_bid || a.starting_price || 0);
    });
    const categoryPerformance = Object.values(catMap).sort((a, b) => b.total - a.total);

    // Dynamic Top Bidders aggregated from actual stored bids
    const bidderMap: Record<string, { user_id: number; bidder_name: string; company_name: string; total_bids: number; highest_bid: number; total_bid_volume: number; winning_auctions: number }> = {};
    storedBids.forEach((b: any) => {
      const bidderName = b.bidder_name || b.user?.name || 'Registered Bidder';
      const companyName = b.bidder_company || 'Metals & Alloys Partner';
      const amt = Number(b.amount) || 0;
      if (!bidderMap[bidderName]) {
        bidderMap[bidderName] = {
          user_id: b.user_id || (Math.abs(bidderName.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)) % 1000 + 1),
          bidder_name: bidderName,
          company_name: companyName,
          total_bids: 0,
          highest_bid: 0,
          total_bid_volume: 0,
          winning_auctions: 0,
        };
      }
      bidderMap[bidderName].total_bids += 1;
      bidderMap[bidderName].highest_bid = Math.max(bidderMap[bidderName].highest_bid, amt);
      bidderMap[bidderName].total_bid_volume += amt;
      if (b.status === 'approved' || b.my_status === 'winning') {
        bidderMap[bidderName].winning_auctions += 1;
      }
    });

    const topBidders = Object.values(bidderMap)
      .sort((a, b) => b.total_bid_volume - a.total_bid_volume)
      .slice(0, 5);

    if (topBidders.length === 0) {
      topBidders.push(
        { user_id: 2, bidder_name: 'Neelkanth Sharma', company_name: 'Metals & Alloys Co', total_bids: 8, highest_bid: 1450000, total_bid_volume: 3250000, winning_auctions: 3 },
        { user_id: 102, bidder_name: 'Western Heavy Recyclers', company_name: 'Western Heavy Corp', total_bids: 5, highest_bid: 1420000, total_bid_volume: 2420000, winning_auctions: 2 }
      );
    }

    return {
      kpi: {
        total_auctions: totalAuctions,
        active_auctions: activeAuctions,
        completed_auctions: completedAuctions,
        total_bids: totalBids,
        total_users: totalUsers,
        total_auction_value: totalAuctionValue,
      },
      bidding_activity: biddingActivity,
      auction_performance: auctionPerformance,
      auction_status: auctionStatus,
      category_performance: categoryPerformance,
      top_bidders: topBidders,
      timestamp: new Date().toISOString(),
    };
  }

  // 10b. GET /admin/users
  if (url.includes('/admin/users') && method === 'get') {
    const rawUsers = getItem('sr_admin_users', getItem('sr_all_users', INITIAL_USERS));
    let masterFound = false;
    const users = (Array.isArray(rawUsers) ? rawUsers : []).map((u: any) => {
      const nameLower = (u.name || '').toLowerCase();
      const emailLower = (u.email || '').toLowerCase();
      const roleLower = (u.role || '').toLowerCase();
      const isDeskOnly = (nameLower.includes('desk') || roleLower === 'read_only_admin' || emailLower === 'inspector@salvagereef.com') && !nameLower.includes('executive');
      const isExecExplicit = nameLower.includes('executive') || emailLower === 'executive@salvagereef.com' || roleLower === 'desk_admin';
      const isMasterCandidate = (u.id === 3 || roleLower === 'master_admin' || emailLower === 'admin@salvagereef.com' || nameLower === 'master admin') && !isDeskOnly && !isExecExplicit;

      if (isMasterCandidate && !masterFound) {
        masterFound = true;
        return {
          ...u,
          id: 3,
          name: 'Master Admin',
          email: 'admin@salvagereef.com',
          role: 'master_admin',
          company_name: 'SalvageReef Master Operations',
          phone: '9820999999',
          is_verified: true,
          is_active: true,
          password: u.password || 'sociial123',
        };
      }

      if ((isMasterCandidate && masterFound) || isExecExplicit) {
        return {
          ...u,
          id: u.id === 3 ? 6 : u.id || 6,
          name: 'SalvageReef Executive Desk Admin',
          email: 'executive@salvagereef.com',
          role: 'desk_admin',
          company_name: 'SalvageReef Executive Desk',
          phone: u.phone && u.phone !== '9820999999' ? u.phone : '9820777777',
          is_verified: true,
          is_active: true,
          password: u.password || 'execadmin123',
        };
      }

      if (isDeskOnly) {
        return {
          ...u,
          id: u.id === 3 ? 5 : u.id || 5,
          name: 'SalvageReef Desk Admin (Read-Only)',
          email: 'inspector@salvagereef.com',
          role: 'read_only_admin',
          company_name: 'SalvageReef Audit Desk (Read-Only)',
          phone: u.phone && u.phone !== '9820999999' ? u.phone : '9820888888',
          is_verified: true,
          is_active: true,
          password: u.password || 'deskadmin123',
        };
      }

      if (u.id === 2 || emailLower === 'bidder@salvagereef.com' || nameLower.includes('bidder')) {
        return {
          ...u,
          id: 2,
          name: u.name || 'Neelkanth Sharma',
          email: 'bidder@salvagereef.com',
          role: 'bidder',
          company_name: u.company_name || 'Metals & Alloys Co',
          phone: u.phone || '9820123456',
          is_verified: true,
          is_active: true,
          password: u.password || 'BidderPass@2026',
        };
      }

      return {
        ...u,
        is_active: u.is_active !== false,
        is_verified: u.is_verified ?? true,
      };
    });

    setItem('sr_admin_users', users);

    return {
      data: users,
      total: users.length,
      active: users.filter((u: any) => u.is_active !== false).length,
      suspended: users.filter((u: any) => u.is_active === false).length,
      verified: users.filter((u: any) => u.is_verified).length,
    };
  }

  // 10b2. POST /admin/users (Create User)
  if (url.includes('/admin/users') && method === 'post') {
    const users = getItem('sr_admin_users', getItem('sr_all_users', INITIAL_USERS));
    const role = bodyData.role || 'bidder';
    const isExec = role === 'desk_admin';
    const isReadOnly = role === 'read_only_admin';
    const isAgent = role === 'agent' || role === 'seller';

    const defaultPass = isExec ? 'execadmin123' : isReadOnly ? 'deskadmin123' : isAgent ? 'SellerPass@2026' : 'BidderPass@2026';
    const defaultCompany = isExec ? 'SalvageReef Executive Desk' : isReadOnly ? 'SalvageReef Audit Desk (Read-Only)' : isAgent ? 'Scrap Metal Partner' : 'Individual Buyer';

    const newUser: any = {
      id: Date.now(),
      name: bodyData.name,
      email: bodyData.email,
      phone: bodyData.phone || '9820123456',
      role: role === 'seller' ? 'agent' : role,
      company_name: bodyData.company_name || defaultCompany,
      city: bodyData.city || 'Mumbai',
      state: bodyData.state || 'Maharashtra',
      password: bodyData.password || defaultPass,
      is_verified: bodyData.is_verified ?? true,
      is_active: bodyData.is_active ?? true,
      created_at: new Date().toISOString().split('T')[0],
    };
    const updated = [newUser, ...users];
    setItem('sr_admin_users', updated);
    setItem('sr_all_users', updated);
    return { message: `User account created successfully with ID #${newUser.id}`, user: newUser };
  }

  // 10b3. PUT /admin/users/:id (Update User)
  if (url.includes('/admin/users/') && !url.endsWith('/toggle-active') && !url.endsWith('/verify') && !url.endsWith('/role') && (method === 'put' || method === 'post')) {
    const parts = url.split('/');
    const userId = Number(parts[parts.indexOf('users') + 1]);
    const users = getItem('sr_admin_users', getItem('sr_all_users', INITIAL_USERS));
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...bodyData };
      setItem('sr_admin_users', users);
      setItem('sr_all_users', users);
    }
    return { message: 'User updated successfully', user: users[idx] };
  }

  // 10b4. DELETE /admin/users/:id
  if (url.includes('/admin/users/') && method === 'delete') {
    const parts = url.split('/');
    const userId = Number(parts[parts.indexOf('users') + 1]);
    let users = getItem('sr_admin_users', getItem('sr_all_users', INITIAL_USERS));
    users = users.filter((u: any) => u.id !== userId);
    setItem('sr_admin_users', users);
    setItem('sr_all_users', users);
    return { message: 'User deleted successfully' };
  }

  // 10c. PUT /admin/users/:id/toggle-active
  if (url.includes('/admin/users/') && url.endsWith('/toggle-active') && method === 'put') {
    const parts = url.split('/');
    const userId = Number(parts[parts.indexOf('users') + 1]);
    const users = getItem('sr_admin_users', getItem('sr_all_users', INITIAL_USERS));
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx !== -1) {
      users[idx].is_active = !users[idx].is_active;
      setItem('sr_admin_users', users);
      setItem('sr_all_users', users);
    }
    return { message: 'User active status updated' };
  }

  // 10d. PUT /admin/users/:id/verify
  if (url.includes('/admin/users/') && url.endsWith('/verify') && method === 'put') {
    const parts = url.split('/');
    const userId = Number(parts[parts.indexOf('users') + 1]);
    const users = getItem('sr_admin_users', getItem('sr_all_users', INITIAL_USERS));
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx !== -1) {
      users[idx].is_verified = !users[idx].is_verified;
      setItem('sr_admin_users', users);
      setItem('sr_all_users', users);
    }
    return { message: 'User verification status updated' };
  }

  // 10e. PUT /admin/users/:id/role
  if (url.includes('/admin/users/') && url.endsWith('/role') && method === 'put') {
    const parts = url.split('/');
    const userId = Number(parts[parts.indexOf('users') + 1]);
    const users = getItem('sr_admin_users', getItem('sr_all_users', INITIAL_USERS));
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx !== -1) {
      users[idx].role = bodyData.role || 'bidder';
      setItem('sr_admin_users', users);
      setItem('sr_all_users', users);
    }
    return { message: 'User role updated' };
  }

  // 10f. GET /admin/auctions/all
  if (url.includes('/admin/auctions/all') && method === 'get') {
    const data = getMockAuctions();
    return { data, total: data.length };
  }

  // 10g. GET /admin/classifieds/all
  if (url.includes('/admin/classifieds/all') && method === 'get') {
    const data = getMockClassifieds();
    return { data, total: data.length };
  }

  // 10h. GET /admin/interests/all
  if (url.includes('/admin/interests/all') && method === 'get') {
    return getMockInterests();
  }

  // 10i. POST /admin/auctions
  if (url.includes('/admin/auctions') && method === 'post') {
    const auctions = getMockAuctions();
    const categories = getMockCategories();
    const currentUser = JSON.parse(localStorage.getItem('salvagereef_user') || 'null') || INITIAL_USERS[2];

    const title = bodyData.title || 'New Admin Auction Lot';
    const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    const categoryObj = categories.find((c) => c.id === Number(bodyData.category_id)) || categories[0];

    const newAuction: Auction = {
      id: Date.now(),
      title,
      slug: uniqueSlug,
      description: bodyData.description || 'Admin created salvage lot.',
      category_id: Number(bodyData.category_id || 1),
      auction_type: bodyData.auction_type || 'public',
      status: 'live',
      quantity: Number(bodyData.quantity || 50),
      unit: bodyData.unit || 'MT',
      starting_price: Number(bodyData.starting_price || 100000),
      current_highest_bid: Number(bodyData.starting_price || 100000),
      start_time: bodyData.start_time || new Date().toISOString(),
      end_time: bodyData.end_time || new Date(Date.now() + 604800000).toISOString(),
      location_city: bodyData.location_city || 'Thane',
      location_state: bodyData.location_state || 'Maharashtra',
      is_group: false,
      created_by: currentUser.id,
      category: categoryObj,
      creator: currentUser,
      images: [
        { id: Date.now(), image_path: bodyData.image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', is_primary: true }
      ],
      primary_image: { id: Date.now(), image_path: bodyData.image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', is_primary: true },
      bids: [],
    };

    auctions.unshift(newAuction);
    setItem('sr_auctions', auctions);
    return newAuction;
  }

  // 10i2. POST /admin/auctions (update auction or list)
  if (url.includes('/admin/auctions') && method === 'post') {
    const auctions = getMockAuctions();
    if (bodyData && bodyData.id) {
      const idx = auctions.findIndex((a) => a.id === bodyData.id);
      if (idx >= 0) {
        auctions[idx] = {
          ...auctions[idx],
          ...bodyData,
          images: bodyData.image_url ? [{ id: Date.now(), image_path: bodyData.image_url, is_primary: true }] : auctions[idx].images,
          primary_image: bodyData.image_url ? { id: Date.now(), image_path: bodyData.image_url, is_primary: true } : auctions[idx].primary_image,
        };
      } else {
        auctions.unshift(bodyData);
      }
      setItem('sr_auctions', auctions);
      return { success: true, message: 'Auction updated', data: auctions[idx] || bodyData };
    } else if (Array.isArray(bodyData)) {
      setItem('sr_auctions', bodyData);
      return { success: true, message: 'Auctions list updated', data: bodyData };
    }
  }

  // 10j. DELETE /admin/auctions/:id
  if ((url.includes('/admin/auctions/') || cleanUrl.includes('/auctions/')) && method === 'delete') {
    const parts = cleanUrl.split('/');
    const idOrSlug = parts[parts.length - 1];
    let auctions = getMockAuctions();
    const beforeCount = auctions.length;
    auctions = auctions.filter((a) => String(a.id) !== String(idOrSlug) && a.slug !== String(idOrSlug));
    setItem('sr_auctions', auctions);
    setItem('sr_admin_auctions', auctions);

    // Clean associated bids
    const adminBids = getItem<any[]>('sr_admin_bids', []);
    const updatedAdminBids = adminBids.filter((b: any) => String(b.auction_id) !== String(idOrSlug));
    setItem('sr_admin_bids', updatedAdminBids);

    // Clean associated interests
    const interests = getMockInterests();
    const updatedInterests = interests.filter((i: any) => String(i.auction_id) !== String(idOrSlug));
    setItem('sr_interests', updatedInterests);
    setItem('sr_admin_interests', updatedInterests);

    return {
      success: true,
      message: 'Auction lot deleted permanently from system records.',
      deleted_id: idOrSlug,
      removed: beforeCount - auctions.length,
    };
  }

  // 10k. DELETE /admin/classifieds/:id
  if ((url.includes('/admin/classifieds/') || cleanUrl.includes('/classifieds/')) && method === 'delete') {
    const parts = cleanUrl.split('/');
    const idOrSlug = parts[parts.length - 1];
    let classifieds = getMockClassifieds();
    const beforeCount = classifieds.length;
    classifieds = classifieds.filter((c) => String(c.id) !== String(idOrSlug) && c.slug !== String(idOrSlug));
    setItem('sr_classifieds', classifieds);
    setItem('sr_admin_classifieds', classifieds);

    return {
      success: true,
      message: 'Classified listing deleted permanently.',
      deleted_id: idOrSlug,
      removed: beforeCount - classifieds.length,
    };
  }

  // 12. POST /auth/login
  if (url.includes('/auth/login') && method === 'post') {
    const rawEmail = (bodyData.email || '').trim();
    const cleanEmail = rawEmail.toLowerCase();
    const cleanPass = (bodyData.password || '').trim();

    const storedUsers: (User & { password?: string; login_id?: string })[] =
      getItem('sr_admin_users', getItem('sr_all_users', INITIAL_USERS));

    // Match exact user by email or login_id
    const matchedUser = storedUsers.find(
      (u) =>
        u.email?.toLowerCase() === cleanEmail ||
        (u.login_id && u.login_id.toLowerCase() === cleanEmail)
    );

    if (!matchedUser) {
      throw new Error('Invalid email or Login ID. Please check your credentials.');
    }

    // Verify password strictly against user's actual password
    const userPass = matchedUser.password || (
      matchedUser.role === 'master_admin' ? 'sociial123' :
      matchedUser.role === 'desk_admin' ? 'execadmin123' :
      matchedUser.role === 'read_only_admin' ? 'deskadmin123' :
      matchedUser.role === 'agent' ? 'SellerPass@2026' :
      'BidderPass@2026'
    );

    // Accept userPass or standard aliases if matched
    const isPassCorrect = cleanPass === userPass ||
      (matchedUser.role === 'agent' && cleanPass === 'seller123') ||
      (matchedUser.role === 'bidder' && cleanPass === 'bidder123') ||
      (matchedUser.role === 'master_admin' && (cleanPass === 'admin123' || cleanPass === 'sociial123')) ||
      (matchedUser.role === 'desk_admin' && (cleanPass === 'execadmin123' || cleanPass === 'desk123')) ||
      (matchedUser.role === 'read_only_admin' && (cleanPass === 'deskadmin123' || cleanPass === 'desk123'));

    if (!isPassCorrect) {
      throw new Error('Incorrect password entered. Please check your password.');
    }

    if (matchedUser.is_active === false) {
      throw new Error('Account suspended by administrator. Please contact support.');
    }

    const { password: _p, ...cleanUser } = matchedUser;
    const token =
      matchedUser.role === 'master_admin' ? 'sr_master_admin_token' :
      matchedUser.role === 'desk_admin' ? 'sr_exec_admin_token' :
      matchedUser.role === 'read_only_admin' ? 'sr_desk_admin_token' :
      'mock-jwt-token-' + Date.now();

    localStorage.setItem('salvagereef_user', JSON.stringify(cleanUser));
    localStorage.setItem('salvagereef_token', token);

    return { user: cleanUser, token };
  }

  // 13. POST /auth/register
  if (url.includes('/auth/register') && method === 'post') {
    const user: User = {
      id: Date.now(),
      name: bodyData.name || 'New Registered User',
      email: bodyData.email || 'user@salvagereef.com',
      phone: bodyData.phone || '7304481166',
      role: bodyData.role || 'bidder',
      company_name: bodyData.company_name || 'Individual Firm',
      city: bodyData.city || 'Thane',
      state: bodyData.state || 'Maharashtra',
      is_verified: true,
    };

    const token = 'mock-jwt-token-' + Date.now();
    return {
      user,
      token,
      message: 'User registered successfully',
    };
  }

  // 14. POST /auth/verify-email-otp or /auth/verify-phone-otp
  if (url.includes('/auth/verify-') && method === 'post') {
    const currentUser = JSON.parse(localStorage.getItem('salvagereef_user') || 'null') || INITIAL_USERS[1];
    const token = localStorage.getItem('salvagereef_token') || 'mock-jwt-token-verified';

    return {
      message: 'Verified successfully',
      is_email_verified: true,
      is_phone_verified: true,
      user: currentUser,
      token,
    };
  }

  // 15. POST /forgot-password/send-otp
  if (url.includes('/forgot-password/send-otp') && method === 'post') {
    return {
      success: true,
      message: 'Verification code sent to your email address! (Demo OTP Code: 123456)',
    };
  }

  // 16. POST /forgot-password/verify-otp
  if (url.includes('/forgot-password/verify-otp') && method === 'post') {
    return {
      success: true,
      verified: true,
      reset_token: 'mock-reset-token-' + Date.now(),
      message: 'OTP verified successfully.',
    };
  }

  // 17. POST /forgot-password/reset
  if (url.includes('/forgot-password/reset') && method === 'post') {
    return {
      success: true,
      message: 'Password reset successfully.',
    };
  }

  // 16. GET /auth/me
  if (url.includes('/auth/me') && method === 'get') {
    const currentUser = JSON.parse(localStorage.getItem('salvagereef_user') || 'null') || INITIAL_USERS[1];
    return { user: currentUser };
  }

  // 17. POST /auth/logout
  if (url.includes('/auth/logout') && method === 'post') {
    return { message: 'Logged out successfully' };
  }

  // 18. GET /system/settings
  if (url.includes('/system/settings') && method === 'get') {
    let stored = JSON.parse(localStorage.getItem('sr_site_content') || 'null');
    if (stored && stored.contactAddress && (stored.contactAddress.includes('Imperial') || stored.contactAddress.includes('Bhayander'))) {
      stored.contactAddress = 'Mumbai, Maharashtra 401101';
      localStorage.setItem('sr_site_content', JSON.stringify(stored));
    }
    return { success: true, settings: stored };
  }

  // 19. POST /admin/settings
  if (url.includes('/admin/settings') && method === 'post') {
    return { success: true, message: 'Settings saved successfully' };
  }

  // 20. GET /system/status
  if (url.includes('/system/status') && method === 'get') {
    const mode = localStorage.getItem('sr_system_mode') || 'online';
    const mMsg = localStorage.getItem('sr_maintenance_message') || 'SalvageReef is currently undergoing scheduled maintenance.';
    const tcMsg = localStorage.getItem('sr_temporary_closed_message') || 'SalvageReef is temporarily closed for operations.';
    let message = '';
    if (mode === 'maintenance') message = mMsg;
    if (mode === 'temporary_closed') message = tcMsg;
    return {
      success: true,
      status: mode,
      system_mode: mode,
      maintenance_mode: mode !== 'online',
      message,
      maintenance_message: mMsg,
      temporary_closed_message: tcMsg,
    };
  }

  // 21. POST /admin/maintenance/toggle
  if (url.includes('/admin/maintenance/toggle') && method === 'post') {
    const sMode = bodyData.system_mode || (bodyData.maintenance_mode ? 'maintenance' : 'online');
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sr_system_mode', sMode);
      if (bodyData.maintenance_message) localStorage.setItem('sr_maintenance_message', bodyData.maintenance_message);
      if (bodyData.temporary_closed_message) localStorage.setItem('sr_temporary_closed_message', bodyData.temporary_closed_message);
    }
    return {
      success: true,
      message: `System mode updated to ${sMode}`,
      system_mode: sMode,
    };
  }

  // 22. POST /errors/report & POST /admin/errors/report
  if ((url.includes('/errors/report') || url.includes('/admin/errors/report')) && method === 'post') {
    let currentLogs: any[] = [];
    if (typeof localStorage !== 'undefined') {
      try {
        currentLogs = JSON.parse(localStorage.getItem('sr_system_error_logs') || '[]');
      } catch {}
    }
    const newErr = {
      id: bodyData.id || Date.now(),
      severity: bodyData.severity || 'error',
      message: bodyData.message || 'Client Exception',
      exception_class: bodyData.exception_class || 'RuntimeError',
      file: bodyData.file || (typeof window !== 'undefined' ? window.location.pathname : 'app'),
      line: bodyData.line || 1,
      url: bodyData.url || (typeof window !== 'undefined' ? window.location.href : '/admin'),
      method: bodyData.method || 'POST',
      status: bodyData.status || 'unresolved',
      user: bodyData.user || null,
      created_at: bodyData.created_at || new Date().toISOString(),
      stack_trace: bodyData.stack_trace || '',
      source: bodyData.source || 'frontend',
    };
    currentLogs = [newErr, ...currentLogs.filter(e => e.id !== newErr.id)].slice(0, 300);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sr_system_error_logs', JSON.stringify(currentLogs));
    }
    return {
      success: true,
      message: 'Error logged successfully',
      error: newErr,
    };
  }

  // 23. GET /admin/errors/stats
  if (url.includes('/admin/errors/stats') && method === 'get') {
    let logs: any[] = [];
    if (typeof localStorage !== 'undefined') {
      try {
        logs = JSON.parse(localStorage.getItem('sr_system_error_logs') || '[]');
      } catch {}
    }
    const mode = (typeof localStorage !== 'undefined' ? localStorage.getItem('sr_system_mode') : null) || 'online';
    const mMsg = (typeof localStorage !== 'undefined' ? localStorage.getItem('sr_maintenance_message') : null) || 'SalvageReef is currently undergoing scheduled platform upgrades to serve you better. We will be back online shortly!';
    const tcMsg = (typeof localStorage !== 'undefined' ? localStorage.getItem('sr_temporary_closed_message') : null) || 'SalvageReef operations are temporarily closed for standard maintenance and operational update. We will reopen shortly!';

    const totalErrors = logs.length;
    const unresolvedErrors = logs.filter(l => l.status === 'unresolved').length;
    const resolvedErrors = logs.filter(l => l.status === 'resolved').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayErrors = logs.filter(l => (l.created_at || '').startsWith(todayStr)).length;
    const criticalErrors = logs.filter(l => l.severity === 'critical' || l.severity === 'fatal').length;

    return {
      success: true,
      stats: {
        total_errors: totalErrors,
        unresolved_errors: unresolvedErrors,
        resolved_errors: resolvedErrors,
        today_errors: todayErrors,
        critical_errors: criticalErrors,
        system_mode: mode,
        is_maintenance: mode !== 'online',
        maintenance_message: mMsg,
        temporary_closed_message: tcMsg,
      },
    };
  }

  // 24. GET /admin/errors
  if (url.includes('/admin/errors') && method === 'get') {
    let logs: any[] = [];
    if (typeof localStorage !== 'undefined') {
      try {
        logs = JSON.parse(localStorage.getItem('sr_system_error_logs') || '[]');
      } catch {}
    }
    return {
      success: true,
      data: {
        data: logs,
        total: logs.length,
        current_page: 1,
        last_page: 1,
      },
    };
  }

  // 25. PUT /admin/errors/{id}/status
  if (url.includes('/admin/errors/') && url.includes('/status') && (method === 'put' || method === 'patch')) {
    let logs: any[] = [];
    if (typeof localStorage !== 'undefined') {
      try {
        logs = JSON.parse(localStorage.getItem('sr_system_error_logs') || '[]');
      } catch {}
    }
    const parts = url.split('/');
    const statusIdx = parts.indexOf('status');
    const id = parts[statusIdx - 1];
    const newStatus = bodyData.status || 'resolved';

    logs = logs.map(l => (id === 'all' || String(l.id) === String(id)) ? { ...l, status: newStatus, resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null } : l);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sr_system_error_logs', JSON.stringify(logs));
    }
    return {
      success: true,
      message: `Error status marked as ${newStatus}`,
    };
  }

  // 26. DELETE /admin/errors/clear
  if (url.includes('/admin/errors/clear') && method === 'delete') {
    const clearMode = bodyData?.mode || 'resolved';
    let logs: any[] = [];
    if (typeof localStorage !== 'undefined') {
      try {
        logs = JSON.parse(localStorage.getItem('sr_system_error_logs') || '[]');
      } catch {}
    }
    if (clearMode === 'all') {
      logs = [];
    } else {
      logs = logs.filter(l => l.status !== 'resolved');
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sr_system_error_logs', JSON.stringify(logs));
    }
    return {
      success: true,
      message: clearMode === 'all' ? 'All system error logs have been cleared.' : 'Resolved error logs have been deleted.',
    };
  }

  // 27. GET /admin/logs
  if (url.includes('/admin/logs') && method === 'get') {
    let logs: any[] = [];
    if (typeof localStorage !== 'undefined') {
      try {
        logs = JSON.parse(localStorage.getItem('sr_system_error_logs') || '[]');
      } catch {}
    }
    const formatted = logs.length > 0
      ? logs.map(l => `[${l.created_at}] [${(l.severity || 'ERROR').toUpperCase()}] [${l.exception_class || 'Exception'}] ${l.message} (${l.file}:${l.line})`).join('\n')
      : `[${new Date().toISOString()}] [INFO] SalvageReef Server Active & Monitoring. Zero fatal crashes reported.`;
    return {
      success: true,
      logs: `[SERVER LOG ALIVE]\n${formatted}`,
      count: logs.length,
    };
  }

  // 28. DELETE /admin/auctions/:id or /auctions/:id
  if ((cleanUrl.includes('/admin/auctions/') || cleanUrl.includes('/auctions/')) && method === 'delete') {
    const parts = cleanUrl.split('/');
    const idOrSlug = parts[parts.length - 1];
    let auctions = getMockAuctions();
    const beforeCount = auctions.length;
    auctions = auctions.filter((a) => String(a.id) !== String(idOrSlug) && a.slug !== String(idOrSlug));
    setItem('sr_auctions', auctions);
    setItem('sr_admin_auctions', auctions);

    // Clean associated bids
    const adminBids = getItem<any[]>('sr_admin_bids', []);
    const updatedAdminBids = adminBids.filter((b: any) => String(b.auction_id) !== String(idOrSlug));
    setItem('sr_admin_bids', updatedAdminBids);

    // Clean associated interests
    const interests = getMockInterests();
    const updatedInterests = interests.filter((i: any) => String(i.auction_id) !== String(idOrSlug));
    setItem('sr_interests', updatedInterests);
    setItem('sr_admin_interests', updatedInterests);

    return {
      success: true,
      message: 'Auction lot deleted permanently from system records.',
      deleted_id: idOrSlug,
      removed: beforeCount - auctions.length,
    };
  }

  // 29. POST /admin/auctions (Create or update auction)
  if (cleanUrl.endsWith('/admin/auctions') && (method === 'post' || method === 'put')) {
    const auctions = getMockAuctions();
    const categories = getMockCategories();
    const currentUser = JSON.parse(localStorage.getItem('salvagereef_user') || 'null') || INITIAL_USERS[0];

    const targetCat = categories.find((c) => c.id === Number(bodyData.category_id)) || categories[0];
    const newAuc: Auction = {
      id: bodyData.id || Date.now(),
      title: bodyData.title || 'New Scrap Lot',
      slug: (bodyData.title || 'lot').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`,
      description: bodyData.description || 'Verified industrial scrap material lot.',
      category_id: Number(bodyData.category_id || 1),
      category: targetCat,
      category_name: targetCat.name,
      starting_price: Number(bodyData.starting_price || 100000),
      current_highest_bid: Number(bodyData.current_highest_bid || bodyData.starting_price || 100000),
      quantity: Number(bodyData.quantity || 10),
      unit: bodyData.unit || 'MT',
      location_city: bodyData.location_city || 'Mumbai',
      location_state: bodyData.location_state || 'Maharashtra',
      auction_type: bodyData.auction_type || 'public',
      status: bodyData.status || 'live',
      start_time: bodyData.start_time || new Date().toISOString(),
      end_time: bodyData.end_time || new Date(Date.now() + 7 * 86400000).toISOString(),
      seller_id: currentUser.id,
      bids: [],
    };

    const existingIdx = auctions.findIndex((a) => a.id === newAuc.id);
    if (existingIdx !== -1) {
      auctions[existingIdx] = { ...auctions[existingIdx], ...newAuc };
    } else {
      auctions.unshift(newAuc);
    }

    setItem('sr_auctions', auctions);
    setItem('sr_admin_auctions', auctions);
    return { success: true, message: 'Auction lot published successfully', data: newAuc };
  }

  // 30. DELETE /admin/classifieds/:id or /classifieds/:id
  if ((cleanUrl.includes('/admin/classifieds/') || cleanUrl.includes('/classifieds/')) && method === 'delete') {
    const parts = cleanUrl.split('/');
    const idOrSlug = parts[parts.length - 1];
    let cls = getMockClassifieds();
    cls = cls.filter((c) => String(c.id) !== String(idOrSlug) && c.slug !== String(idOrSlug));
    setItem('sr_classifieds', cls);
    setItem('sr_admin_classifieds', cls);
    return {
      success: true,
      message: 'Classified listing deleted successfully.',
      deleted_id: idOrSlug,
    };
  }

  // 31. DELETE /admin/users/:id
  if (cleanUrl.includes('/admin/users/') && method === 'delete') {
    const parts = cleanUrl.split('/');
    const userId = parts[parts.length - 1];
    const users = getItem<any[]>('sr_admin_users', INITIAL_USERS);
    const updatedUsers = users.filter((u: any) => String(u.id) !== String(userId));
    setItem('sr_admin_users', updatedUsers);
    return {
      success: true,
      message: 'User account removed from database.',
      deleted_id: userId,
    };
  }

  // 32. DELETE /admin/categories/:id
  if (cleanUrl.includes('/admin/categories/') && method === 'delete') {
    const parts = cleanUrl.split('/');
    const catId = parts[parts.length - 1];
    let cats = getMockCategories();
    cats = cats.filter((c) => String(c.id) !== String(catId));
    setItem('sr_categories', cats);
    return { success: true, message: 'Category deleted.', deleted_id: catId };
  }

  // 33. DELETE /admin/interests/:id
  if (cleanUrl.includes('/admin/interests/') && method === 'delete') {
    const parts = cleanUrl.split('/');
    const intId = parts[parts.length - 1];
    let ints = getMockInterests();
    ints = ints.filter((i) => String(i.id) !== String(intId));
    setItem('sr_interests', ints);
    setItem('sr_admin_interests', ints);
    return { success: true, message: 'Interest removed.', deleted_id: intId };
  }

  // 34. POST /errors/report
  if (cleanUrl.endsWith('/errors/report') && method === 'post') {
    let logs: any[] = [];
    if (typeof localStorage !== 'undefined') {
      try {
        logs = JSON.parse(localStorage.getItem('sr_system_error_logs') || '[]');
      } catch {}
    }
    const newLog = {
      id: bodyData.id || Date.now(),
      severity: bodyData.severity || 'error',
      message: bodyData.message || 'Reported Application Error',
      exception_class: bodyData.exception_class || 'ClientError',
      file: bodyData.file || 'unknown',
      line: bodyData.line || 1,
      url: bodyData.url || '/admin',
      method: bodyData.method || 'API',
      status: 'unresolved',
      created_at: bodyData.created_at || new Date().toISOString(),
      stack_trace: bodyData.stack_trace || '',
      source: bodyData.source || 'api',
    };
    logs = [newLog, ...logs.filter(l => l.message !== newLog.message)].slice(0, 300);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sr_system_error_logs', JSON.stringify(logs));
    }
    return { success: true, message: 'Error log captured', data: newLog };
  }

  // Default fallback for any unmatched GET endpoint
  if (method === 'get') {
    return { data: [] };
  }

  // Default fallback for write endpoints
  return { success: true, message: 'Operation completed successfully' };
}
