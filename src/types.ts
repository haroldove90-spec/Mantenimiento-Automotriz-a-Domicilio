export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  clientId: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  color?: string;
  createdAt: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  clientId: string;
  vehicleId: string;
  serviceType: string;
  status: AppointmentStatus;
  date: string;
  notes?: string;
  estimatedCost: number;
  whatsappSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Quote {
  id: string;
  appointmentId: string;
  items: QuoteItem[];
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  createdAt: string;
}

export interface ServiceRecord {
  id: string;
  appointmentId: string;
  clientId: string;
  vehicleId: string;
  completedAt: string;
  summary: string;
  photos: string[];
  maintenanceReminders: string[];
  whatsappEvidenceSent: boolean;
}
