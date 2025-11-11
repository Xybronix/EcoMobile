// Mock data simulating GPS API responses
import { BikePosition, User, Trip, Incident, PricingPlan } from '../types';

// Export extended mock data
export { 
  mockEmployees, 
  mockRoles, 
  mockPermissions, 
  mockActivityLogs, 
  mockTransactions, 
  mockCompanySettings 
} from './mockDataExtended';

export interface PricingPlan_Old {
  id: string;
  name: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  discount: number;
  isActive: boolean;
  conditions: string[];
}

export interface Incident_Old {
  id: string;
  userId: string;
  userName: string;
  bikeId: string;
  bikeName: string;
  type: 'technical' | 'accident' | 'damaged' | 'payment' | 'theft';
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  createdAt: string;
  refundAmount: number | null;
  photos: string[];
}

// Mock GPS data - Simulating bikes in Douala, Cameroon
export const mockBikes: BikePosition[] = [
  {
    id: '1',
    imei: '862104020000001',
    name: 'Vélo #001',
    lat: 4.0511,
    lon: 9.7679,
    status: 'available',
    battery: 85,
    gpsSignal: 95,
    gsmSignal: 88,
    speed: 0,
    lastUpdate: new Date().toISOString(),
    zone: 'Akwa',
    totalTrips: 456,
    isActive: true
  },
  {
    id: '2',
    imei: '862104020000002',
    name: 'Vélo #002',
    lat: 4.0489,
    lon: 9.7701,
    status: 'in-use',
    battery: 72,
    gpsSignal: 92,
    gsmSignal: 85,
    speed: 18,
    lastUpdate: new Date().toISOString(),
    zone: 'Bonanjo',
    totalTrips: 328,
    isActive: true
  },
  {
    id: '3',
    imei: '862104020000003',
    name: 'Vélo #003',
    lat: 4.0445,
    lon: 9.7598,
    status: 'available',
    battery: 95,
    gpsSignal: 98,
    gsmSignal: 90,
    speed: 0,
    lastUpdate: new Date().toISOString(),
    zone: 'Deido',
    totalTrips: 892,
    isActive: true
  },
  {
    id: '4',
    imei: '862104020000004',
    name: 'Vélo #004',
    lat: 4.0612,
    lon: 9.7421,
    status: 'low-battery',
    battery: 15,
    gpsSignal: 87,
    gsmSignal: 82,
    speed: 0,
    lastUpdate: new Date().toISOString(),
    zone: 'Bonaberi',
    totalTrips: 0,
    isActive: true
  },
  {
    id: '5',
    imei: '862104020000005',
    name: 'Vélo #005',
    lat: 4.0532,
    lon: 9.7745,
    status: 'maintenance',
    battery: 0,
    gpsSignal: 0,
    gsmSignal: 0,
    speed: 0,
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    zone: 'Bali',
    totalTrips: 654,
    isActive: true
  },
  {
    id: '6',
    imei: '862104020000006',
    name: 'Vélo #006',
    lat: 4.0478,
    lon: 9.7612,
    status: 'in-use',
    battery: 68,
    gpsSignal: 94,
    gsmSignal: 89,
    speed: 22,
    lastUpdate: new Date().toISOString(),
    zone: 'Akwa'
  },
  {
    id: '7',
    imei: '862104020000007',
    name: 'Vélo #007',
    lat: 4.0556,
    lon: 9.7689,
    status: 'available',
    battery: 88,
    gpsSignal: 96,
    gsmSignal: 91,
    speed: 0,
    lastUpdate: new Date().toISOString(),
    zone: 'Bonanjo'
  },
  {
    id: '8',
    imei: '862104020000008',
    name: 'Vélo #008',
    lat: 4.0423,
    lon: 9.7523,
    status: 'available',
    battery: 91,
    gpsSignal: 97,
    gsmSignal: 86,
    speed: 0,
    lastUpdate: new Date().toISOString(),
    zone: 'Deido'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Jean Kamga',
    email: 'jean.kamga@email.cm',
    phone: '+237 690 123 456',
    accountBalance: 5000,
    totalTrips: 42,
    totalSpent: 21000,
    status: 'active',
    joinDate: '2024-08-15',
    reliabilityScore: 4.8
  },
  {
    id: '2',
    name: 'Marie Nkotto',
    email: 'marie.nkotto@email.cm',
    phone: '+237 675 234 567',
    accountBalance: 3500,
    totalTrips: 28,
    totalSpent: 14000,
    status: 'active',
    joinDate: '2024-09-01',
    reliabilityScore: 4.9
  },
  {
    id: '3',
    name: 'Paul Biya Jr',
    email: 'paul.biya@email.cm',
    phone: '+237 655 345 678',
    accountBalance: 0,
    totalTrips: 15,
    totalSpent: 7500,
    status: 'active',
    joinDate: '2024-09-20',
    reliabilityScore: 4.2
  },
  {
    id: '4',
    name: 'Fatou Mboua',
    email: 'fatou.mboua@email.cm',
    phone: '+237 691 456 789',
    accountBalance: 8000,
    totalTrips: 67,
    totalSpent: 33500,
    status: 'active',
    joinDate: '2024-07-10',
    reliabilityScore: 5.0
  },
  {
    id: '5',
    name: 'Ahmed Diouf',
    email: 'ahmed.diouf@email.cm',
    phone: '+237 670 567 890',
    accountBalance: 1200,
    totalTrips: 8,
    totalSpent: 4000,
    status: 'blocked',
    joinDate: '2024-09-25',
    reliabilityScore: 2.5
  }
];

export const mockTrips: Trip[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Jean Kamga',
    bikeId: '2',
    bikeName: 'Vélo #002',
    startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    endTime: null,
    distance: 3.2,
    duration: 45,
    cost: 0,
    status: 'active'
  },
  {
    id: '2',
    userId: '4',
    userName: 'Fatou Mboua',
    bikeId: '6',
    bikeName: 'Vélo #006',
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    endTime: null,
    distance: 2.1,
    duration: 30,
    cost: 0,
    status: 'active'
  },
  {
    id: '3',
    userId: '2',
    userName: 'Marie Nkotto',
    bikeId: '1',
    bikeName: 'Vélo #001',
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    distance: 5.7,
    duration: 60,
    cost: 200,
    status: 'completed'
  }
];

export const mockIncidents: Incident[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Jean Kamga',
    bikeId: '3',
    bikeName: 'Vélo #003',
    type: 'technical',
    description: 'Le frein arrière ne fonctionne pas correctement',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    refundAmount: null,
    photos: []
  },
  {
    id: '2',
    userId: '4',
    userName: 'Fatou Mboua',
    bikeId: '5',
    bikeName: 'Vélo #005',
    type: 'damaged',
    description: 'Vélo trouvé avec un pneu crevé',
    status: 'in-progress',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    refundAmount: 200,
    photos: []
  },
  {
    id: '3',
    userId: '2',
    userName: 'Marie Nkotto',
    bikeId: '7',
    bikeName: 'Vélo #007',
    type: 'payment',
    description: 'Erreur de prélèvement - montant incorrect',
    status: 'resolved',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    refundAmount: 500,
    photos: []
  },
  {
    id: '4',
    userId: '5',
    userName: 'Ahmed Diouf',
    bikeId: '4',
    bikeName: 'Vélo #004',
    type: 'accident',
    description: 'Collision mineure avec piéton',
    status: 'rejected',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    refundAmount: null,
    photos: []
  }
];

export const mockPricingPlans: PricingPlan[] = [
  {
    id: '1',
    name: 'Standard',
    hourlyRate: 200,
    dailyRate: 3200,
    weeklyRate: 18200,
    monthlyRate: 60000,
    discount: 0,
    isActive: true,
    conditions: ['Tarif de base', 'Disponible 24/7']
  },
  {
    id: '2',
    name: 'Heures de Pointe',
    hourlyRate: 300,
    dailyRate: 4800,
    weeklyRate: 27300,
    monthlyRate: 90000,
    discount: 0,
    isActive: true,
    conditions: ['7h-9h et 17h-19h', 'Lundi-Vendredi']
  },
  {
    id: '3',
    name: 'Weekend',
    hourlyRate: 250,
    dailyRate: 4000,
    weeklyRate: 22750,
    monthlyRate: 75000,
    discount: 25,
    isActive: true,
    conditions: ['Samedi-Dimanche', 'Tarif majoré +25%']
  },
  {
    id: '4',
    name: 'Étudiant',
    hourlyRate: 150,
    dailyRate: 2400,
    weeklyRate: 13650,
    monthlyRate: 45000,
    discount: 25,
    isActive: true,
    conditions: ['Carte étudiant requise', 'Réduction 25%']
  }
];

export const mockStats = {
  totalBikes: mockBikes.length,
  availableBikes: mockBikes.filter(b => b.status === 'available').length,
  bikesInUse: mockBikes.filter(b => b.status === 'in-use').length,
  bikesInMaintenance: mockBikes.filter(b => b.status === 'maintenance').length,
  totalUsers: mockUsers.length,
  activeUsers: mockUsers.filter(u => u.status === 'active').length,
  todayRevenue: 24500,
  weekRevenue: 156000,
  monthRevenue: 624000,
  activeTrips: mockTrips.filter(t => t.status === 'active').length,
  completedTripsToday: 42,
  pendingIncidents: mockIncidents.filter(i => i.status === 'pending').length,
  averageTripDuration: 38,
  averageTripDistance: 4.2,
  totalDistance: 1245,
  occupancyRate: 68
};