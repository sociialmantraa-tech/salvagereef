import { Auction, Classified, Category, User, Bid } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Scrap Heavy Machinery', slug: 'scrap-heavy-machinery', auctions_count: 5, classifieds_count: 8 },
  { id: 2, name: 'Non-Ferrous Copper & Brass', slug: 'non-ferrous-copper-brass', auctions_count: 4, classifieds_count: 6 },
  { id: 3, name: 'Ferrous Heavy Melting Steel (HMS)', slug: 'ferrous-hms', auctions_count: 6, classifieds_count: 10 },
  { id: 4, name: 'E-Waste & Circuit Boards', slug: 'e-waste-circuit-boards', auctions_count: 3, classifieds_count: 4 },
  { id: 5, name: 'Industrial Boilers & Turbines', slug: 'industrial-boilers-turbines', auctions_count: 2, classifieds_count: 3 },
  { id: 6, name: 'Vehicle Dismantling & Auto Scrap', slug: 'vehicle-dismantling-auto-scrap', auctions_count: 3, classifieds_count: 5 },
];

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: 'SalvageReef Verified Seller',
    email: 'seller@salvagereef.com',
    phone: '7304481166',
    role: 'agent',
    company_name: 'Apex Scrap Recyclers Ltd',
    city: 'Mumbai',
    state: 'Maharashtra',
    is_verified: true,
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    email: 'bidder@salvagereef.com',
    phone: '9820123456',
    role: 'bidder',
    company_name: 'Metals & Alloys Co',
    city: 'Mumbai',
    state: 'Maharashtra',
    is_verified: true,
  },
  {
    id: 3,
    name: 'SalvageReef Desk Admin',
    email: 'admin@salvagereef.com',
    phone: '9820999999',
    role: 'admin',
    company_name: 'SalvageReef Operations Desk',
    city: 'Mumbai',
    state: 'Maharashtra',
    is_verified: true,
  },
];

export const INITIAL_AUCTIONS: Auction[] = [
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

// Helper functions for persistent LocalStorage DB
const getItem = <T>(key: string, defaultVal: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setItem = <T>(key: string, val: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
};

export const getMockCategories = (): Category[] => getItem('sr_categories', INITIAL_CATEGORIES);
export const getMockAuctions = (): Auction[] => getItem('sr_auctions', INITIAL_AUCTIONS);
export const getMockClassifieds = (): Classified[] => getItem('sr_classifieds', INITIAL_CLASSIFIEDS);
export const getMockInterests = (): any[] => getItem('sr_interests', INITIAL_INTERESTS);
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

      // Save to user bids
      const userBids = getMockUserBids();
      userBids.unshift({
        id: Date.now(),
        auction_title: auctions[aucIndex].title,
        auction_slug: auctions[aucIndex].slug,
        created_at: new Date().toISOString(),
        bid_amount: amount,
        my_status: 'winning',
      });
      setItem('sr_user_bids', userBids);
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

  // 4. GET /auctions/:slug_or_id (Single Auction detail)
  const isSingleAuction = /\/auctions\/[^\/]+$/.test(cleanUrl) && !cleanUrl.endsWith('/auctions');
  if (isSingleAuction && method === 'get') {
    const parts = cleanUrl.split('/');
    const slugOrId = parts[parts.length - 1];

    const auctions = getMockAuctions();
    const auction = auctions.find((a) => a.slug === slugOrId || String(a.id) === slugOrId) || auctions[0];

    const interests = getMockInterests();
    const currentUser = JSON.parse(localStorage.getItem('salvagereef_user') || 'null');
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

  // 10b. GET /admin/users
  if (url.includes('/admin/users') && method === 'get') {
    const users = getItem('sr_all_users', INITIAL_USERS);
    return {
      data: users,
      total: users.length,
      active: users.filter((u: any) => u.is_active !== false).length,
      suspended: users.filter((u: any) => u.is_active === false).length,
      verified: users.filter((u: any) => u.is_verified).length,
    };
  }

  // 10c. PUT /admin/users/:id/toggle-active
  if (url.includes('/admin/users/') && url.endsWith('/toggle-active') && method === 'put') {
    const parts = url.split('/');
    const userId = Number(parts[parts.indexOf('users') + 1]);
    const users = getItem('sr_all_users', INITIAL_USERS);
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx !== -1) {
      users[idx].is_active = !users[idx].is_active;
      setItem('sr_all_users', users);
    }
    return { message: 'User active status updated' };
  }

  // 10d. PUT /admin/users/:id/verify
  if (url.includes('/admin/users/') && url.endsWith('/verify') && method === 'put') {
    const parts = url.split('/');
    const userId = Number(parts[parts.indexOf('users') + 1]);
    const users = getItem('sr_all_users', INITIAL_USERS);
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx !== -1) {
      users[idx].is_verified = !users[idx].is_verified;
      setItem('sr_all_users', users);
    }
    return { message: 'User verification status updated' };
  }

  // 10e. PUT /admin/users/:id/role
  if (url.includes('/admin/users/') && url.endsWith('/role') && method === 'put') {
    const parts = url.split('/');
    const userId = Number(parts[parts.indexOf('users') + 1]);
    const users = getItem('sr_all_users', INITIAL_USERS);
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx !== -1) {
      users[idx].role = bodyData.role || 'bidder';
      setItem('sr_all_users', users);
    }
    return { message: 'User role updated' };
  }

  // 10f. GET /admin/auctions/all
  if (url.includes('/admin/auctions/all') && method === 'get') {
    return getMockAuctions();
  }

  // 10g. GET /admin/classifieds/all
  if (url.includes('/admin/classifieds/all') && method === 'get') {
    return getMockClassifieds();
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
  if (url.includes('/admin/auctions/') && method === 'delete') {
    const parts = url.split('/');
    const auctionId = Number(parts[parts.length - 1]);
    const auctions = getMockAuctions();
    const updated = auctions.filter((a) => a.id !== auctionId);
    setItem('sr_auctions', updated);
    return { message: 'Auction deleted' };
  }

  // 10k. DELETE /admin/classifieds/:id
  if (url.includes('/admin/classifieds/') && method === 'delete') {
    const parts = url.split('/');
    const classifiedId = Number(parts[parts.length - 1]);
    const classifieds = getMockClassifieds();
    const updated = classifieds.filter((c) => c.id !== classifiedId);
    setItem('sr_classifieds', updated);
    return { message: 'Classified deleted' };
  }

  // 12. POST /auth/login
  if (url.includes('/auth/login') && method === 'post') {
    const email = (bodyData.email || '').toLowerCase();
    const isAdmin = email.includes('admin');

    const user: User = isAdmin
      ? {
          id: 3,
          name: 'SalvageReef Desk Admin',
          email,
          phone: '9820999999',
          role: 'admin',
          company_name: 'SalvageReef Operations Desk',
          city: 'Mumbai',
          state: 'Maharashtra',
          is_verified: true,
        }
      : {
          id: 2,
          name: email.split('@')[0] ? email.split('@')[0].replace('.', ' ') : 'Rajesh Kumar',
          email,
          phone: '9820123456',
          role: 'bidder',
          company_name: 'Metals & Alloys Co',
          city: 'Thane',
          state: 'Maharashtra',
          is_verified: true,
        };

    const token = 'mock-jwt-token-' + Date.now();
    localStorage.setItem('salvagereef_user', JSON.stringify(user));
    localStorage.setItem('salvagereef_token', token);

    return { user, token };
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
    return {
      success: true,
      message: 'System mode updated',
    };
  }

  // Default fallback for any unmatched GET endpoint
  return { data: [] };
}
