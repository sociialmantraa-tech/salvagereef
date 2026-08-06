export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: 'admin' | 'agent' | 'bidder';
  company_name?: string | null;
  city?: string | null;
  state?: string | null;
  is_verified?: boolean;
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
  bidder_name?: string;
  user?: {
    name: string;
  };
  created_at: string;
}

export interface Auction {
  id: number;
  title: string;
  slug: string;
  description: string;
  category_id: number;
  auction_type: 'public' | 'private' | 'group';
  status: 'draft' | 'upcoming' | 'live' | 'closed';
  quantity: number;
  unit: string;
  starting_price: number;
  current_highest_bid?: number | null;
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
