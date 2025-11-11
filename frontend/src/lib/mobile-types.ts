// Types for mobile application

export interface MobileUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  profileImage?: string;
  language: 'fr' | 'en';
  wallet: {
    balance: number;
    currency: string;
  };
  verificationStatus: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  createdAt: Date;
}

export interface Bike {
  id: string;
  name: string;
  status: 'available' | 'in-use' | 'maintenance' | 'reserved';
  battery: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  lastUpdate: Date;
  model: string;
  image?: string;
  qrCode: string;
  pricePerMinute: number;
  features: string[];
  equipment?: string[]; // Équipements du vélo (phares, panier, etc.)
}

export interface Ride {
  id: string;
  bikeId: string;
  bikeName: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  startLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  endLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  distance: number; // in km
  duration: number; // in minutes
  cost: number;
  status: 'active' | 'completed' | 'cancelled';
  route?: Array<{ lat: number; lng: number; timestamp: Date }>;
}

export interface Reservation {
  id: string;
  bikeId: string;
  bikeName: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired' | 'used' | 'cancelled';
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface Payment {
  id: string;
  userId: string;
  type: 'ride' | 'wallet-topup' | 'refund';
  amount: number;
  currency: string;
  method: 'orange-money' | 'mobile-money' | 'wallet';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  completedAt?: Date;
  reference: string;
  details?: {
    rideId?: string;
    phoneNumber?: string;
    transactionId?: string;
  };
}

export interface Incident {
  id: string;
  userId: string;
  bikeId?: string;
  rideId?: string;
  type: 'technical' | 'accident' | 'theft' | 'damage' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  images: string[];
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  refundAmount?: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'ride' | 'payment' | 'incident' | 'promotion' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  data?: Record<string, unknown>;
}

// API Integration types
export interface GPSApiConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  endpoints: {
    login: string;
    getLastPosition: string;
    getCar: string;
    [key: string]: string;
  };
}

export interface PaymentApiConfig {
  name: string;
  provider: 'orange-money' | 'mobile-money';
  baseUrl: string;
  apiKey: string;
  merchantId: string;
  endpoints: {
    initiate: string;
    verify: string;
    refund: string;
    [key: string]: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: Date;
}
