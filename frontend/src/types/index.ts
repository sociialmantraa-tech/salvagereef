export interface User {
  id: number;
  name: string;
  email: string;
  login_id?: string | null;
  phone?: string | null;
  role?: 'master_admin' | 'desk_admin' | 'read_only_admin' | 'admin' | 'agent' | 'bidder' | 'seller' | 'buyer';
  company_name?: string | null;
  entity_type?: string | null;
  pan_number?: string | null;
  gst_number?: string | null;
  registered_address?: string | null;
  pincode?: string | null;
  spoc_name?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_ifsc_code?: string | null;
  cheque_file?: string | null;
  pan_file?: string | null;
  gst_file?: string | null;
  city?: string | null;
  state?: string | null;
  is_verified?: boolean;
  is_active?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  auctions_count?: number;
  classifieds_count?: number;
}

export interface AuctionImage {
  id?: number;
  auction_id?: number;
  image_path: string;
  is_primary?: boolean;
}

export interface Bid {
  id?: number;
  auction_id?: number;
  user_id?: number;
  amount: number;
  status?: 'pending' | 'approved' | 'rejected';
  bidder_name?: string;
  user?: {
    name: string;
    email?: string;
  };
  created_at: string;
}

export interface Auction {
  id: number;
  lot_code?: string;
  title: string;
  slug: string;
  description: string;
  condition?: string | null;
  category_id: number;
  auction_type: 'public' | 'private' | 'group';
  status: 'draft' | 'upcoming' | 'live' | 'closed' | 'completed' | 'cancelled';
  quantity: number;
  unit: string;
  starting_price: number;
  emd_amount?: number | null;
  bid_increment?: number;
  current_highest_bid?: number | null;
  winner_confirmed?: boolean | number;
  winner_user_id?: number | null;
  winner_h1_user_id?: number | null;
  winner_h2_user_id?: number | null;
  winner_h3_user_id?: number | null;
  awarded_winner_type?: 'H1' | 'H2' | 'H3' | null;
  awarded_winner_id?: number | null;
  start_time?: string;
  end_time?: string;
  location_city: string;
  location_state: string;
  is_group?: boolean;
  group_id?: number | null;
  created_by: number;
  category?: Category;
  images?: AuctionImage[];
  primary_image?: AuctionImage;
  bids?: Bid[];
  creator?: User;
  group_children?: Auction[];
}

export interface ClassifiedImage {
  id?: number;
  classified_id?: number;
  image_path: string;
  is_primary?: boolean;
}

export interface Classified {
  id: number;
  title: string;
  slug: string;
  description: string;
  category_id: number;
  price: number;
  quantity: number;
  unit: string;
  location_city: string;
  location_state: string;
  status: 'available' | 'sold';
  created_by: number;
  category?: Category;
  images?: ClassifiedImage[];
  primary_image?: ClassifiedImage;
  creator?: User;
}

export interface EnquiryOrInterest {
  id: number;
  auction_id: number;
  user_id: number;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  user?: User;
}
