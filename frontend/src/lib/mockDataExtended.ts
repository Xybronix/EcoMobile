// Extended mock data for new features

import { 
  Employee,
  Role,
  Permission,
  ActivityLog,
  CompanySettings,
  Transaction
} from '../types';

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@freebike.com',
    phone: '+237 690 000 001',
    role: 'Super Admin',
    permissions: ['all'],
    status: 'active',
    joinDate: '2024-01-15',
    hireDate: '2024-01-15',
    lastLogin: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Jean Dupont',
    email: 'jean.dupont@freebike.com',
    phone: '+237 690 000 002',
    role: 'Manager',
    permissions: ['bikes.view', 'bikes.edit', 'users.view', 'financial.view'],
    status: 'active',
    joinDate: '2024-03-10',
    hireDate: '2024-03-10',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Marie Ngo',
    email: 'marie.ngo@freebike.com',
    phone: '+237 690 000 003',
    role: 'Support Agent',
    permissions: ['incidents.view', 'incidents.edit', 'users.view'],
    status: 'active',
    joinDate: '2024-05-20',
    hireDate: '2024-05-20',
    lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    name: 'Paul Ebogo',
    email: 'paul.ebogo@freebike.com',
    phone: '+237 690 000 004',
    role: 'Technician',
    permissions: ['bikes.view', 'bikes.edit', 'bikes.maintenance'],
    status: 'active',
    joinDate: '2024-06-01',
    hireDate: '2024-06-01',
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    name: 'Sarah Kono',
    email: 'sarah.kono@freebike.com',
    phone: '+237 690 000 005',
    role: 'Manager',
    permissions: ['bikes.view', 'bikes.edit', 'users.view', 'financial.view'],
    status: 'blocked',
    joinDate: '2024-04-12',
    hireDate: '2024-04-12',
    lastLogin: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
  }
];

export const mockPermissions: Permission[] = [
  // Bikes
  { id: '1', name: 'bikes.view', description: 'Voir les vélos', category: 'bikes' },
  { id: '2', name: 'bikes.create', description: 'Créer un vélo', category: 'bikes' },
  { id: '3', name: 'bikes.edit', description: 'Modifier un vélo', category: 'bikes' },
  { id: '4', name: 'bikes.delete', description: 'Supprimer un vélo', category: 'bikes' },
  { id: '5', name: 'bikes.maintenance', description: 'Gérer la maintenance', category: 'bikes' },
  
  // Users
  { id: '6', name: 'users.view', description: 'Voir les utilisateurs', category: 'users' },
  { id: '7', name: 'users.edit', description: 'Modifier les utilisateurs', category: 'users' },
  { id: '8', name: 'users.block', description: 'Bloquer/débloquer les utilisateurs', category: 'users' },
  
  // Financial
  { id: '9', name: 'financial.view', description: 'Voir les finances', category: 'financial' },
  { id: '10', name: 'financial.edit', description: 'Modifier les finances', category: 'financial' },
  { id: '11', name: 'financial.pricing', description: 'Gérer la tarification', category: 'financial' },
  
  // Incidents
  { id: '12', name: 'incidents.view', description: 'Voir les signalements', category: 'incidents' },
  { id: '13', name: 'incidents.edit', description: 'Traiter les signalements', category: 'incidents' },
  { id: '14', name: 'incidents.approve', description: 'Approuver les remboursements', category: 'incidents' },
  
  // Employees
  { id: '15', name: 'employees.view', description: 'Voir les employés', category: 'employees' },
  { id: '16', name: 'employees.create', description: 'Créer un employé', category: 'employees' },
  { id: '17', name: 'employees.edit', description: 'Modifier un employé', category: 'employees' },
  { id: '18', name: 'employees.delete', description: 'Supprimer un employé', category: 'employees' },
  { id: '19', name: 'employees.roles', description: 'Gérer les rôles', category: 'employees' },
  
  // Settings
  { id: '20', name: 'settings.view', description: 'Voir les paramètres', category: 'settings' },
  { id: '21', name: 'settings.edit', description: 'Modifier les paramètres', category: 'settings' },
];

export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Accès complet à toutes les fonctionnalités',
    permissions: mockPermissions,
    employeeCount: 1,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Manager',
    description: 'Gestion opérationnelle de la flotte et des utilisateurs',
    permissions: mockPermissions.filter(p => 
      ['bikes.view', 'bikes.edit', 'users.view', 'users.edit', 'financial.view', 'incidents.view'].includes(p.name)
    ),
    employeeCount: 2,
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    name: 'Support Agent',
    description: 'Support client et traitement des signalements',
    permissions: mockPermissions.filter(p => 
      ['incidents.view', 'incidents.edit', 'users.view'].includes(p.name)
    ),
    employeeCount: 1,
    createdAt: '2024-01-01'
  },
  {
    id: '4',
    name: 'Technician',
    description: 'Maintenance et réparation des vélos',
    permissions: mockPermissions.filter(p => 
      ['bikes.view', 'bikes.edit', 'bikes.maintenance'].includes(p.name)
    ),
    employeeCount: 1,
    createdAt: '2024-01-01'
  }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'Admin User',
    employeeRole: 'Super Admin',
    action: 'bike.create',
    description: 'Ajout du vélo #008',
    category: 'bikes',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.1'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Jean Dupont',
    employeeRole: 'Manager',
    action: 'user.block',
    description: 'Blocage de l\'utilisateur Ahmed Diouf',
    category: 'users',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.2'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Marie Ngo',
    employeeRole: 'Support Agent',
    action: 'incident.resolve',
    description: 'Résolution du signalement #3 avec remboursement de 500 FCFA',
    category: 'incidents',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.3'
  },
  {
    id: '4',
    employeeId: '4',
    employeeName: 'Paul Ebogo',
    employeeRole: 'Technician',
    action: 'bike.maintenance',
    description: 'Mise en maintenance du vélo #005',
    category: 'bikes',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.4'
  },
  {
    id: '5',
    employeeId: '1',
    employeeName: 'Admin User',
    employeeRole: 'Super Admin',
    action: 'pricing.update',
    description: 'Modification du tarif Étudiant',
    category: 'pricing',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.1'
  },
  {
    id: '6',
    employeeId: '2',
    employeeName: 'Jean Dupont',
    employeeRole: 'Manager',
    action: 'user.edit',
    description: 'Modification du profil de Fatou Mboua',
    category: 'users',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.2'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Jean Kamga',
    type: 'recharge',
    amount: 5000,
    method: 'orange-money',
    status: 'completed',
    reference: 'OM-2024-001234',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Rechargement compte Orange Money'
  },
  {
    id: '2',
    userId: '1',
    userName: 'Jean Kamga',
    type: 'payment',
    amount: -200,
    method: 'orange-money',
    status: 'completed',
    reference: 'PAY-2024-001235',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Paiement trajet #3'
  },
  {
    id: '3',
    userId: '2',
    userName: 'Marie Nkotto',
    type: 'recharge',
    amount: 3500,
    method: 'mobile-money',
    status: 'completed',
    reference: 'MM-2024-001236',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Rechargement compte Mobile Money'
  },
  {
    id: '4',
    userId: '2',
    userName: 'Marie Nkotto',
    type: 'refund',
    amount: 500,
    method: 'mobile-money',
    status: 'completed',
    reference: 'REF-2024-001237',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Remboursement incident #3'
  },
  {
    id: '5',
    userId: '4',
    userName: 'Fatou Mboua',
    type: 'recharge',
    amount: 10000,
    method: 'orange-money',
    status: 'completed',
    reference: 'OM-2024-001238',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Rechargement compte Orange Money'
  }
];

export const mockCompanySettings: CompanySettings = {
  id: '1',
  companyName: 'Freebike Cameroun',
  email: 'contact@freebike.cm',
  phone: '+237 690 000 000',
  address: '123 Avenue de la Liberté',
  city: 'Douala',
  country: 'Cameroun',
  orangeMoneyNumber: '+237 690 000 000',
  mobileMoneyNumber: '+237 675 000 000',
  facebook: 'https://facebook.com/freebikecm',
  twitter: 'https://twitter.com/freebikecm',
  instagram: 'https://instagram.com/freebikecm',
  linkedin: 'https://linkedin.com/company/freebike',
  website: 'https://freebike.cm',
  description: 'Service de location de vélos électriques à Douala'
};
