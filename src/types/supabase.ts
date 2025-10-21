export interface SiteAppearance {
  id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  primary_font: string;
  secondary_font: string;
  logo_url: string | null;
  hero_image_url: string | null;
  background_type: 'color' | 'image';
  background_color: string | null;
  background_image_url: string | null;
  background_opacity: number;
  updated_at: string;
}

export interface SiteContent {
  id: string;
  page: string;
  section: string;
  content_key: string;
  content_value: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  category: string | null;
  visible: boolean;
  display_order: number;
  created_at: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string | null;
  image_url: string | null;
  button_text: string | null;
  button_url: string | null;
  map_url: string | null;
  visible: boolean;
  display_order: number;
  created_at: string;
}

export interface Amenity {
  id: string;
  title: string;
  icon_name: string | null;
  image_url: string | null;
  visible: boolean;
  display_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_location: string | null;
  comment: string;
  rating: number;
  visible: boolean;
  created_at: string;
}

export interface LearnMoreSection {
  id: string;
  title: string;
  content: string;
  visible: boolean;
  display_order: number;
  created_at: string;
}

export interface TermsSection {
  id: string;
  title: string;
  content: string;
  title_color: string | null;
  content_color: string | null;
  title_weight: string | null;
  content_weight: string | null;
  visible: boolean;
  display_order: number;
  created_at: string;
}

export interface SectionBackground {
  id: string;
  page: string;
  section_name: string;
  background_type: 'color' | 'image';
  background_value: string;
  opacity: number;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
}
