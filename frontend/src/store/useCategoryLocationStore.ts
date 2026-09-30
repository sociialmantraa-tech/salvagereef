import { create } from 'zustand';
import { Category } from '../types';
import api from '../services/api';
import { broadcastRealtimeEvent } from '../services/realtimeSync';

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
    'Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad (Chhatrapati Sambhajinagar)',
    'Bhiwandi', 'Palghar', 'Vasai-Virar', 'Kolhapur', 'Solapur', 'Amravati', 'Nanded', 'Jalgaon',
    'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Panvel', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Jalna', 'Wardha', 'Gondia'
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar',
    'Gandhinagar', 'Ankleshwar', 'Vapi', 'Morbi', 'Junagadh', 'Bharuch',
    'Anand', 'Mehsana', 'Gandhidham', 'Porbandar', 'Navsari', 'Surendranagar', 'Alang', 'Palanpur', 'Valsad'
  ],
  'Delhi NCR': [
    'Delhi', 'New Delhi', 'Gurugram', 'Noida', 'Greater Noida', 'Ghaziabad', 'Faridabad', 'Sonipat', 'Bahadurgarh'
  ],
  'Karnataka': [
    'Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi', 'Kalaburagi', 'Shivamogga',
    'Ballari', 'Tumakuru', 'Davanagere', 'Udupi', 'Hosapete', 'Bidar', 'Hassan', 'Raichur'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode', 'Vellore',
    'Thoothukudi (Tuticorin)', 'Tirunelveli', 'Dindigul', 'Thanjavur', 'Ranipet', 'Hosur', 'Kanchipuram', 'Nagercoil', 'Cuddalore', 'Karur'
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur', 'Haldia', 'Bardhaman', 'Malda', 'Hooghly', 'Berhampore', 'Raniganj'
  ],
  'Telangana': [
    'Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Medak'
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bhiwadi', 'Alwar', 'Bhilwara', 'Ajmer',
    'Bikaner', 'Sikar', 'Sri Ganganagar', 'Pali', 'Neemrana', 'Bharatpur', 'Beawar', 'Hanumangarh'
  ],
  'Uttar Pradesh': [
    'Kanpur', 'Lucknow', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Noida', 'Greater Noida',
    'Aligarh', 'Moradabad', 'Bareilly', 'Prayagraj (Allahabad)', 'Gorakhpur', 'Saharanpur', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Ayodhya', 'Rampur', 'Shahjahanpur'
  ],
  'Haryana': [
    'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Hisar', 'Sonipat', 'Rohtak',
    'Karnal', 'Bahadurgarh', 'Panchkula', 'Rewari', 'Palwal', 'Jind', 'Sirsa', 'Kaithal'
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali (SAS Nagar)', 'Khanna',
    'Mandi Gobindgarh', 'Hoshiarpur', 'Pathankot', 'Phagwara', 'Moga', 'Batala', 'Abohar'
  ],
  'Madhya Pradesh': [
    'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Pithampur', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Singrauli', 'Rewa', 'Katni', 'Burhanpur', 'Chhindwara'
  ],
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Kakinada', 'Rajahmundry', 'Tirupati', 'Anantapur', 'Kadapa', 'Eluru', 'Vizianagaram'
  ],
  'Kerala': [
    'Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram', 'Kasaragod'
  ],
  'Andaman & Nicobar Islands': [
    'Port Blair', 'Garacharma', 'Diglipur'
  ],
  'Arunachal Pradesh': [
    'Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'
  ],
  'Assam': [
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Bongaigaon', 'Tezpur'
  ],
  'Bihar': [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Begusarai', 'Katihar', 'Ara'
  ],
  'Chandigarh': [
    'Chandigarh'
  ],
  'Chhattisgarh': [
    'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Raigarh', 'Jagdalpur'
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Daman', 'Diu', 'Silvassa'
  ],
  'Goa': [
    'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'
  ],
  'Himachal Pradesh': [
    'Baddi', 'Shimla', 'Solan', 'Dharamshala', 'Mandi', 'Kullu', 'Paonta Sahib', 'Una', 'Nalagarh', 'Kala Amb'
  ],
  'Jammu & Kashmir': [
    'Srinagar', 'Jammu', 'Anantnag', 'Udhampur', 'Baramulla', 'Kathua', 'Sopore'
  ],
  'Jharkhand': [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Ramgarh', 'Giridih'
  ],
  'Ladakh': [
    'Leh', 'Kargil'
  ],
  'Lakshadweep': [
    'Kavaratti', 'Agatti', 'Andrott'
  ],
  'Manipur': [
    'Imphal', 'Churachandpur', 'Thoubal'
  ],
  'Meghalaya': [
    'Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Byrnihat'
  ],
  'Mizoram': [
    'Aizawl', 'Lunglei', 'Champhai'
  ],
  'Nagaland': [
    'Kohima', 'Dimapur', 'Mokokchung'
  ],
  'Odisha': [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Jharsuguda', 'Angul', 'Paradip', 'Jajpur'
  ],
  'Puducherry': [
    'Puducherry', 'Karaikal', 'Ozhukarai', 'Yanam', 'Mahe'
  ],
  'Sikkim': [
    'Gangtok', 'Namchi', 'Singtam', 'Rangpo'
  ],
  'Tripura': [
    'Agartala', 'Dharmanagar', 'Udaipur'
  ],
  'Uttarakhand': [
    'Dehradun', 'Haridwar', 'Roorkee', 'Rudrapur', 'Haldwani', 'Rishikesh', 'Pantnagar', 'Kashipur', 'Kotdwar'
  ],
};

export const INDIAN_STATES = Object.keys(STATE_CITIES_MAP).sort((a, b) => a.localeCompare(b));

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
  fetchCategoriesAndLocations: () => Promise<void>;
  addCategory: (name: string, slug?: string) => Promise<void>;
  updateCategory: (id: number, name: string, slug?: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  addLocation: (city: string, state?: string) => Promise<void>;
  updateLocation: (id: number, city: string, state?: string) => Promise<void>;
  deleteLocation: (id: number) => Promise<void>;
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

export const useCategoryLocationStore = create<CategoryLocationStore>((set, get) => ({
  categories: getStoredCategories(),
  locations: getStoredLocations(),

  fetchCategoriesAndLocations: async () => {
    try {
      const [catRes, locRes] = await Promise.all([
        api.get('/categories').catch(() => null),
        api.get('/locations').catch(() => null),
      ]);

      if (catRes && catRes.data) {
        const rawCats = Array.isArray(catRes.data)
          ? catRes.data
          : (catRes.data.data || catRes.data.categories || []);
        if (Array.isArray(rawCats) && rawCats.length > 0) {
          safeSetItem('sr_categories', JSON.stringify(rawCats));
          set({ categories: rawCats });
        }
      }

      if (locRes && locRes.data) {
        const rawLocs = Array.isArray(locRes.data)
          ? locRes.data
          : (locRes.data.data || locRes.data.locations || []);
        if (Array.isArray(rawLocs) && rawLocs.length > 0) {
          const sortedLocs = [...rawLocs].sort((a, b) => (a.city || '').localeCompare(b.city || ''));
          safeSetItem('sr_locations', JSON.stringify(sortedLocs));
          set({ locations: sortedLocs });
        }
      }
    } catch (e) {
      console.warn('Could not refresh categories and locations:', e);
    }
  },

  addCategory: async (name, slug) => {
    const formattedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newCat: Category = {
      id: Date.now(),
      name: name.trim(),
      slug: formattedSlug,
      auctions_count: 0,
      classifieds_count: 0,
    };
    const updated = [...get().categories, newCat];
    safeSetItem('sr_categories', JSON.stringify(updated));
    set({ categories: updated });

    try {
      await api.post('/categories', { name: name.trim(), slug: formattedSlug });
      broadcastRealtimeEvent({ type: 'category_created', data: newCat, timestamp: Date.now() });
    } catch (e) {
      console.warn('Backend category sync fallback:', e);
    }
  },

  updateCategory: async (id, name, slug) => {
    const formattedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const updated = get().categories.map((c) =>
      c.id === id ? { ...c, name: name.trim(), slug: formattedSlug } : c
    );
    safeSetItem('sr_categories', JSON.stringify(updated));
    set({ categories: updated });

    try {
      await api.put(`/categories/${id}`, { name: name.trim(), slug: formattedSlug });
      broadcastRealtimeEvent({ type: 'category_updated', data: { id, name, slug: formattedSlug }, timestamp: Date.now() });
    } catch (e) {
      console.warn('Backend category sync fallback:', e);
    }
  },

  deleteCategory: async (id) => {
    const updated = get().categories.filter((c) => c.id !== id);
    safeSetItem('sr_categories', JSON.stringify(updated));
    set({ categories: updated });

    try {
      await api.delete(`/categories/${id}`);
      broadcastRealtimeEvent({ type: 'category_deleted', data: { id }, timestamp: Date.now() });
    } catch (e) {
      console.warn('Backend category delete sync fallback:', e);
    }
  },

  addLocation: async (city, stateName = 'Maharashtra') => {
    const trimmedCity = city.trim();
    const trimmedState = stateName.trim() || 'Maharashtra';
    
    // Check if location already exists
    const exists = get().locations.some(
      (l) => l.city.toLowerCase() === trimmedCity.toLowerCase() && l.state.toLowerCase() === trimmedState.toLowerCase()
    );
    if (exists) return;

    const newLoc: LocationItem = {
      id: Date.now(),
      city: trimmedCity,
      state: trimmedState,
      is_active: true,
    };
    const updated = [...get().locations, newLoc].sort((a, b) => a.city.localeCompare(b.city));
    safeSetItem('sr_locations', JSON.stringify(updated));
    set({ locations: updated });

    try {
      await api.post('/locations', { city: trimmedCity, state: trimmedState });
      broadcastRealtimeEvent({ type: 'location_created', data: newLoc, timestamp: Date.now() });
    } catch (e) {
      console.warn('Backend location sync fallback:', e);
    }
  },

  updateLocation: async (id, city, stateName = 'Maharashtra') => {
    const trimmedCity = city.trim();
    const trimmedState = stateName.trim() || 'Maharashtra';
    const updated = get().locations.map((loc) =>
      loc.id === id ? { ...loc, city: trimmedCity, state: trimmedState } : loc
    ).sort((a, b) => a.city.localeCompare(b.city));
    
    safeSetItem('sr_locations', JSON.stringify(updated));
    set({ locations: updated });

    try {
      await api.put(`/locations/${id}`, { city: trimmedCity, state: trimmedState });
      broadcastRealtimeEvent({ type: 'location_updated', data: { id, city: trimmedCity, state: trimmedState }, timestamp: Date.now() });
    } catch (e) {
      console.warn('Backend location update fallback:', e);
    }
  },

  deleteLocation: async (id) => {
    const updated = get().locations.filter((loc) => loc.id !== id);
    safeSetItem('sr_locations', JSON.stringify(updated));
    set({ locations: updated });

    try {
      await api.delete(`/locations/${id}`);
      broadcastRealtimeEvent({ type: 'location_deleted', data: { id }, timestamp: Date.now() });
    } catch (e) {
      console.warn('Backend location delete fallback:', e);
    }
  },

  setCategories: (cats) => {
    safeSetItem('sr_categories', JSON.stringify(cats));
    set({ categories: cats });
  },

  setLocations: (locs) => {
    const sorted = [...locs].sort((a, b) => (a.city || '').localeCompare(b.city || ''));
    safeSetItem('sr_locations', JSON.stringify(sorted));
    set({ locations: sorted });
  },
}));

