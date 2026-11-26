export type RideStatus = "upcoming" | "archive";
export type RideCategory = "rabo" | "sporty" | "sunday" | "ngelayap" | "collab";
export type ArticleCategory = "cerita" | "ngelayap" | "budaya" | "bikecheck" | "impact";
export type DocCategory = "street" | "hangout" | "collab";
export type MerchCategory = "apparel" | "gear" | "art" | "archive";

export interface RideRider {
  id: string;
  rideId: string;
  name: string;
  bike: string;
  note?: string;
  deviceToken?: string;
  isMe?: boolean;
  checkedIn: boolean;
  createdAt: string;
}

export interface RideFeedback {
  id: string;
  rideId: string;
  author: string;
  tag: string;
  note: string;
  createdAt: string;
}

export interface RideBrosur {
  isCollab: boolean;
  cardPerk: string;
  quota: string;
  points: string[];
  giveback: string;
  prompt: string;
}

export interface Ride {
  id: string;
  status: RideStatus;
  category: RideCategory;
  badge: string;
  dateBadge: string;
  title: string;
  schedule: string;
  tikum: string;
  distance: string;
  bikes: string;
  pace: string;
  accentBg: string;
  accentText: string;
  highlight: string;
  elevation: number[];
  ridersAttended?: string;
  zineSlug?: string;
  brosur: RideBrosur;
  riders: RideRider[];
  feedbacks: RideFeedback[];
  sortOrder: number;
}

export interface Article {
  slug: string;
  cat: ArticleCategory;
  rubrik: string;
  tagBg: string;
  tagFg: string;
  dateLabel: string;
  readTime: string;
  author: string;
  bikeTag: string;
  location: string;
  distance: string;
  applause: number;
  title: string;
  subtitle: string;
  excerpt: string;
  quote: string;
  coverKey: string;
  coverImageUrl?: string;
  paragraphs: string[];
  published: boolean;
  createdAt: string;
}

export interface DocItem {
  id: string;
  type: "photo" | "video";
  mediaUrl: string;
  posterUrl?: string;
  cat: DocCategory;
  catLabel: string;
  dateStamp: string;
  location: string;
  title: string;
  caption: string;
  tilt: string;
  tapeRot: string;
  tapeClass: string;
  sortOrder: number;
}

export interface MerchItem {
  id: string;
  cat: MerchCategory;
  status: string;
  statusBg: string;
  statusFg: string;
  soldOut: boolean;
  title: string;
  price: string;
  sizes: string[];
  impactNote: string;
  description: string;
  artKey: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface StorySubmission {
  id: string;
  title: string;
  author: string;
  cat: ArticleCategory;
  body: string;
  status: "pending" | "published" | "archived";
  createdAt: string;
}

export interface CollabInquiry {
  id: string;
  topic: string;
  brandName: string;
  contact: string;
  message: string;
  status: "new" | "contacted" | "done";
  createdAt: string;
}

export interface SiteSettings {
  whatsappAdmin: string;
  treeCount: number;
}

export interface DatabaseState {
  rides: Ride[];
  articles: Article[];
  docItems: DocItem[];
  merchItems: MerchItem[];
  storySubmissions: StorySubmission[];
  collabInquiries: CollabInquiry[];
  settings: SiteSettings;
}
