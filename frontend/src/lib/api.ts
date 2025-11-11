// API Service Layer - Replace with real API calls

import { 
  BikePosition, 
  User, 
  Trip, 
  Transaction,
  Incident, 
  PricingPlan,
  Employee,
  Role,
  Permission,
  ActivityLog,
  CompanySettings,
  ApiResponse 
} from '../types';

import { 
  mockBikes, 
  mockUsers, 
  mockTrips, 
  mockIncidents, 
  mockPricingPlans,
  mockEmployees,
  mockRoles,
  mockPermissions,
  mockActivityLogs,
  mockTransactions,
  mockCompanySettings
} from './mockData';

// Base API configuration
const API_BASE_URL = '/api';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    // TODO: Uncomment when real API is ready
    // const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    //   ...options,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     ...options?.headers,
    //   },
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`API Error: ${response.statusText}`);
    // }
    // 
    // const data = await response.json();
    // return { success: true, data };
    
    // Mock response for now
    return { success: true, data: {} as T };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============ BIKES API ============
export const bikesApi = {
  getAll: async (): Promise<BikePosition[]> => {
    // TODO: return (await apiCall<BikePosition[]>('/bikes')).data || [];
    return mockBikes;
  },

  getById: async (id: string): Promise<BikePosition | null> => {
    // TODO: return (await apiCall<BikePosition>(`/bikes/${id}`)).data || null;
    return mockBikes.find(b => b.id === id) || null;
  },

  create: async (bike: Partial<BikePosition>): Promise<BikePosition> => {
    // TODO: return (await apiCall<BikePosition>('/bikes', { method: 'POST', body: JSON.stringify(bike) })).data!;
    const newBike: BikePosition = {
      id: String(mockBikes.length + 1),
      ...bike as BikePosition
    };
    mockBikes.push(newBike);
    return newBike;
  },

  update: async (id: string, bike: Partial<BikePosition>): Promise<BikePosition> => {
    // TODO: return (await apiCall<BikePosition>(`/bikes/${id}`, { method: 'PUT', body: JSON.stringify(bike) })).data!;
    const index = mockBikes.findIndex(b => b.id === id);
    if (index !== -1) {
      mockBikes[index] = { ...mockBikes[index], ...bike };
      return mockBikes[index];
    }
    throw new Error('Bike not found');
  },

  delete: async (id: string): Promise<void> => {
    // TODO: await apiCall(`/bikes/${id}`, { method: 'DELETE' });
    const index = mockBikes.findIndex(b => b.id === id);
    if (index !== -1) {
      mockBikes.splice(index, 1);
    }
  }
};

// ============ USERS API ============
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    // TODO: return (await apiCall<User[]>('/users')).data || [];
    return mockUsers;
  },

  getById: async (id: string): Promise<User | null> => {
    // TODO: return (await apiCall<User>(`/users/${id}`)).data || null;
    return mockUsers.find(u => u.id === id) || null;
  },

  update: async (id: string, user: Partial<User>): Promise<User> => {
    // TODO: return (await apiCall<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(user) })).data!;
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...user };
      return mockUsers[index];
    }
    throw new Error('User not found');
  },

  block: async (id: string): Promise<void> => {
    // TODO: await apiCall(`/users/${id}/block`, { method: 'POST' });
    await usersApi.update(id, { status: 'blocked' });
  },

  unblock: async (id: string): Promise<void> => {
    // TODO: await apiCall(`/users/${id}/unblock`, { method: 'POST' });
    await usersApi.update(id, { status: 'active' });
  }
};

// ============ TRANSACTIONS API ============
export const transactionsApi = {
  getByUserId: async (userId: string): Promise<Transaction[]> => {
    // TODO: return (await apiCall<Transaction[]>(`/users/${userId}/transactions`)).data || [];
    return mockTransactions.filter(t => t.userId === userId);
  },

  getAll: async (): Promise<Transaction[]> => {
    // TODO: return (await apiCall<Transaction[]>('/transactions')).data || [];
    return mockTransactions;
  }
};

// ============ TRIPS API ============
export const tripsApi = {
  getByUserId: async (userId: string): Promise<Trip[]> => {
    // TODO: return (await apiCall<Trip[]>(`/users/${userId}/trips`)).data || [];
    return mockTrips.filter(t => t.userId === userId);
  },

  getAll: async (): Promise<Trip[]> => {
    // TODO: return (await apiCall<Trip[]>('/trips')).data || [];
    return mockTrips;
  }
};

// ============ INCIDENTS API ============
export const incidentsApi = {
  getAll: async (): Promise<Incident[]> => {
    // TODO: return (await apiCall<Incident[]>('/incidents')).data || [];
    return mockIncidents;
  },

  getByUserId: async (userId: string): Promise<Incident[]> => {
    // TODO: return (await apiCall<Incident[]>(`/users/${userId}/incidents`)).data || [];
    return mockIncidents.filter(i => i.userId === userId);
  },

  update: async (id: string, incident: Partial<Incident>): Promise<Incident> => {
    // TODO: return (await apiCall<Incident>(`/incidents/${id}`, { method: 'PUT', body: JSON.stringify(incident) })).data!;
    const index = mockIncidents.findIndex(i => i.id === id);
    if (index !== -1) {
      mockIncidents[index] = { ...mockIncidents[index], ...incident };
      return mockIncidents[index];
    }
    throw new Error('Incident not found');
  }
};

// ============ PRICING API ============
export const pricingApi = {
  getAll: async (): Promise<PricingPlan[]> => {
    // TODO: return (await apiCall<PricingPlan[]>('/pricing')).data || [];
    return mockPricingPlans;
  },

  create: async (plan: Partial<PricingPlan>): Promise<PricingPlan> => {
    // TODO: return (await apiCall<PricingPlan>('/pricing', { method: 'POST', body: JSON.stringify(plan) })).data!;
    const newPlan: PricingPlan = {
      id: String(mockPricingPlans.length + 1),
      ...plan as PricingPlan
    };
    mockPricingPlans.push(newPlan);
    return newPlan;
  },

  update: async (id: string, plan: Partial<PricingPlan>): Promise<PricingPlan> => {
    // TODO: return (await apiCall<PricingPlan>(`/pricing/${id}`, { method: 'PUT', body: JSON.stringify(plan) })).data!;
    const index = mockPricingPlans.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPricingPlans[index] = { ...mockPricingPlans[index], ...plan };
      return mockPricingPlans[index];
    }
    throw new Error('Pricing plan not found');
  }
};

// ============ EMPLOYEES API ============
export const employeesApi = {
  getAll: async (): Promise<Employee[]> => {
    // TODO: return (await apiCall<Employee[]>('/employees')).data || [];
    return mockEmployees;
  },

  getById: async (id: string): Promise<Employee | null> => {
    // TODO: return (await apiCall<Employee>(`/employees/${id}`)).data || null;
    return mockEmployees.find(e => e.id === id) || null;
  },

  create: async (employee: Partial<Employee>): Promise<Employee> => {
    // TODO: return (await apiCall<Employee>('/employees', { method: 'POST', body: JSON.stringify(employee) })).data!;
    const newEmployee: Employee = {
      id: String(mockEmployees.length + 1),
      ...employee as Employee
    };
    mockEmployees.push(newEmployee);
    return newEmployee;
  },

  update: async (id: string, employee: Partial<Employee>): Promise<Employee> => {
    // TODO: return (await apiCall<Employee>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(employee) })).data!;
    const index = mockEmployees.findIndex(e => e.id === id);
    if (index !== -1) {
      mockEmployees[index] = { ...mockEmployees[index], ...employee };
      return mockEmployees[index];
    }
    throw new Error('Employee not found');
  },

  delete: async (id: string): Promise<void> => {
    // TODO: await apiCall(`/employees/${id}`, { method: 'DELETE' });
    const index = mockEmployees.findIndex(e => e.id === id);
    if (index !== -1) {
      mockEmployees.splice(index, 1);
    }
  }
};

// ============ ROLES API ============
export const rolesApi = {
  getAll: async (): Promise<Role[]> => {
    // TODO: return (await apiCall<Role[]>('/roles')).data || [];
    return mockRoles;
  },

  create: async (role: Partial<Role>): Promise<Role> => {
    // TODO: return (await apiCall<Role>('/roles', { method: 'POST', body: JSON.stringify(role) })).data!;
    const newRole: Role = {
      id: String(mockRoles.length + 1),
      ...role as Role
    };
    mockRoles.push(newRole);
    return newRole;
  },

  update: async (id: string, role: Partial<Role>): Promise<Role> => {
    // TODO: return (await apiCall<Role>(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(role) })).data!;
    const index = mockRoles.findIndex(r => r.id === id);
    if (index !== -1) {
      mockRoles[index] = { ...mockRoles[index], ...role };
      return mockRoles[index];
    }
    throw new Error('Role not found');
  },

  delete: async (id: string): Promise<void> => {
    // TODO: await apiCall(`/roles/${id}`, { method: 'DELETE' });
    const index = mockRoles.findIndex(r => r.id === id);
    if (index !== -1) {
      mockRoles.splice(index, 1);
    }
  },

  getPermissions: async (): Promise<Permission[]> => {
    // TODO: return (await apiCall<Permission[]>('/permissions')).data || [];
    return mockPermissions;
  }
};

// ============ ACTIVITY LOGS API ============
export const logsApi = {
  getAll: async (filters?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    role?: string;
  }): Promise<ActivityLog[]> => {
    // TODO: return (await apiCall<ActivityLog[]>('/logs', { method: 'POST', body: JSON.stringify(filters) })).data || [];
    let logs = [...mockActivityLogs];
    
    if (filters?.employeeId) {
      logs = logs.filter(l => l.employeeId === filters.employeeId);
    }
    if (filters?.role) {
      logs = logs.filter(l => l.employeeRole === filters.role);
    }
    if (filters?.startDate) {
      logs = logs.filter(l => new Date(l.timestamp) >= new Date(filters.startDate!));
    }
    if (filters?.endDate) {
      logs = logs.filter(l => new Date(l.timestamp) <= new Date(filters.endDate!));
    }
    
    return logs;
  }
};

// ============ SETTINGS API ============
export const settingsApi = {
  get: async (): Promise<CompanySettings> => {
    // TODO: return (await apiCall<CompanySettings>('/settings')).data!;
    return mockCompanySettings;
  },

  update: async (settings: Partial<CompanySettings>): Promise<CompanySettings> => {
    // TODO: return (await apiCall<CompanySettings>('/settings', { method: 'PUT', body: JSON.stringify(settings) })).data!;
    Object.assign(mockCompanySettings, settings);
    return mockCompanySettings;
  }
};
