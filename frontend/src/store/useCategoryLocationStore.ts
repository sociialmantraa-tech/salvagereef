import { create } from 'zustand';
import { Category } from '../types';

export interface LocationItem {
  id: number;
  city: string;
  state: string;
  is_active: boolean;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Scrap Heavy Machinery & Plant Equipment', slug: 'scrap-heavy-machinery', auctions_count: 8, classifieds_count: 12 },
  { id: 2, name: 'Non-Ferrous Copper, Brass & Aluminium Scrap', slug: 'non-ferrous-copper-brass', auctions_count: 6, classifieds_count: 10 },
  { id: 3, name: 'Ferrous Heavy Melting Steel (HMS 1 & 2) & Iron', slug: 'ferrous-hms', auctions_count: 9, classifieds_count: 15 },
  { id: 4, name: 'Damaged Vehicles, Fleet Salvage & Commercial Trucks', slug: 'damaged-vehicles-fleet', auctions_count: 5, classifieds_count: 7 },
  { id: 5, name: 'E-Waste, Server Racks & Circuit Boards', slug: 'e-waste-circuit-boards', auctions_count: 4, classifieds_count: 6 },
  { id: 6, name: 'Industrial Boilers, Turbines & Transformers', slug: 'industrial-boilers-turbines', auctions_count: 3, classifieds_count: 4 },
  { id: 7, name: 'Industrial Electric Motors & Cable Lots', slug: 'electric-motors-cables', auctions_count: 5, classifieds_count: 8 },
  { id: 8, name: 'Plastic, Rubber & Synthetic Industrial Scrap', slug: 'plastic-rubber-scrap', auctions_count: 3, classifieds_count: 5 },
  { id: 9, name: 'Battery, Lead Acid & UPS Power Lots', slug: 'battery-lead-acid-scrap', auctions_count: 4, classifieds_count: 6 },
  { id: 10, name: 'Demolition Scrap & Rebar Steel Structures', slug: 'demolition-rebar-scrap', auctions_count: 4, classifieds_count: 5 },
  { id: 11, name: 'Paper, Cardboard & Packaging Mill Scrap', slug: 'paper-packaging-scrap', auctions_count: 2, classifieds_count: 4 },
  { id: 12, name: 'Surplus Industrial Idle Assets & Equipment', slug: 'industrial-idle-assets', auctions_count: 6, classifieds_count: 9 },
];

export const STATE_CITIES_MAP: Record<string, string[]> = {
  'Maharashtra': [
    'Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad',
    'Bhiwandi', 'Palghar', 'Vasai-Virar', 'Kolhapur', 'Solapur', 'Amravati', 'Nanded', 'Jalgaon'
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar',
    'Gandhinagar', 'Ankleshwar', 'Vapi', 'Morbi', 'Junagadh', 'Bharuch'
  ],
  'Delhi NCR': [
    'Delhi', 'Gurugram', 'Noida', 'Greater Noida', 'Ghaziabad', 'Faridabad'
  ],
  'Karnataka': [
    'Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi', 'Kalaburagi', 'Shivamogga'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode', 'Vellore'
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur', 'Haldia'
  ],
  'Telangana': [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam'
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bhiwadi', 'Alwar', 'Bhilwara', 'Ajmer'
  ],
  'Uttar Pradesh': [
    'Kanpur', 'Lucknow', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Noida', 'Aligarh', 'Moradabad', 'Bareilly'
  ],
  'Haryana': [
    'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Hisar', 'Sonipat', 'Rohtak'
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Khanna'
  ],
  'Madhya Pradesh': [
    'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Pithampur', 'Ujjain', 'Sagar'
  ],
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kakinada', 'Tirupati', 'Rajahmundry'
  ],
  'Kerala': [
    'Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad'
  ],
};

export const INDIAN_STATES = Object.keys(STATE_CITIES_MAP);

export const DEFAULT_LOCATIONS: LocationItem[] = [
  { id: 1, city: 'Mumbai', state: 'Maharashtra', is_active: true },
  { id: 2, city: 'Thane', state: 'Maharashtra', is_active: true },
  { id: 3, city: 'Navi Mumbai', state: 'Maharashtra', is_active: true },
  { id: 4, city: 'Pune', state: 'Maharashtra', is_active: true },
  { id: 5, city: 'Ahmedabad', state: 'Gujarat', is_active: true },
  { id: 6, city: 'Delhi', state: 'Delhi NCR', is_active: true },
  { id: 7, city: 'Bengaluru', state: 'Karnataka', is_active: true },
];

interface CategoryLocationStore {
  categories: Category[];
  locations: LocationItem[];
  addCategory: (name: string, slug?: string) => void;
  updateCategory: (id: number, name: string, slug?: string) => void;
  deleteCategory: (id: number) => void;
  addLocation: (city: string, state?: string) => void;
  updateLocation: (id: number, city: string, state?: string) => void;
  deleteLocation: (id: number) => void;
  setCategories: (categories: Category[]) => void;
  setLocations: (locations: LocationItem[]) => void;
}

const safeGetItem = (key: string): string | null => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  try { return localStorage.getItem(key); } catch { return null; }
};

const safeSetItem = (key: string, val: string) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try { localStorage.setItem(key, val); } catch {}
};

const getStoredCategories = (): Category[] => {
  try {
    const stored = safeGetItem('sr_categories');
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
};

const getStoredLocations = (): LocationItem[] => {
  try {
    const stored = safeGetItem('sr_locations');
    return stored ? JSON.parse(stored) : DEFAULT_LOCATIONS;
  } catch {
    return DEFAULT_LOCATIONS;
  }
};

export const useCategoryLocationStore = create<CategoryLocationStore>((set) => ({
  categories: getStoredCategories(),
  locations: getStoredLocations(),

  addCategory: (name, slug) =>
    set((state) => {
      const formattedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const newCat: Category = {
        id: Date.now(),
        name: name.trim(),
        slug: formattedSlug,
        auctions_count: 0,
        classifieds_count: 0,
      };
      const updated = [...state.categories, newCat];
      safeSetItem('sr_categories', JSON.stringify(updated));
      return { categories: updated };
    }),

  updateCategory: (id, name, slug) =>
    set((state) => {
      const formattedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const updated = state.categories.map((c) =>
        c.id === id ? { ...c, name: name.trim(), slug: formattedSlug } : c
      );
      safeSetItem('sr_categories', JSON.stringify(updated));
      return { categories: updated };
    }),

  deleteCategory: (id) =>
    set((state) => {
      const updated = state.categories.filter((c) => c.id !== id);
      safeSetItem('sr_categories', JSON.stringify(updated));
      return { categories: updated };
    }),

  addLocation: (city, stateName = 'Maharashtra') =>
    set((state) => {
      const newLoc: LocationItem = {
        id: Date.now(),
        city: city.trim(),
        state: stateName.trim() || 'Maharashtra',
        is_active: true,
      };
      const updated = [...state.locations, newLoc];
      safeSetItem('sr_locations', JSON.stringify(updated));
      return { locations: updated };
    }),

  updateLocation: (id, city, stateName = 'Maharashtra') =>
    set((state) => {
      const updated = state.locations.map((loc) =>
        loc.id === id ? { ...loc, city: city.trim(), state: stateName.trim() } : loc
      );
      safeSetItem('sr_locations', JSON.stringify(updated));
      return { locations: updated };
    }),

  deleteLocation: (id) =>
    set((state) => {
      const updated = state.locations.filter((loc) => loc.id !== id);
      safeSetItem('sr_locations', JSON.stringify(updated));
      return { locations: updated };
    }),

  setCategories: (cats) => {
    safeSetItem('sr_categories', JSON.stringify(cats));
    set({ categories: cats });
  },

  setLocations: (locs) => {
    safeSetItem('sr_locations', JSON.stringify(locs));
    set({ locations: locs });
  },
}));
