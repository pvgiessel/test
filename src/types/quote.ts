export type ServiceType = 'consultancy' | 'functioneel-beheer' | 'payroll' | 'horizon-bi';

export interface ConsultancyConfig {
  type: 'consultancy';
  consultancyType: string;
  days: number;
  dailyRate: number;
  description: string;
}

export interface FunctioneelBeheerConfig {
  type: 'functioneel-beheer';
  hoursPerMonth: number;
  hourlyRate: number;
  contractMonths: number;
  description: string;
}

export interface PayrollConfig {
  type: 'payroll';
  employees: number;
  pricePerEmployee: number;
  setupFee: number;
  description: string;
}

export interface HorizonBIConfig {
  type: 'horizon-bi';
  tier: 'starter' | 'professional' | 'enterprise';
  dashboards: number;
  monthlyFee: number;
  setupFee: number;
  description: string;
}

export type ServiceConfig =
  | ConsultancyConfig
  | FunctioneelBeheerConfig
  | PayrollConfig
  | HorizonBIConfig;

export interface QuoteService {
  id: string;
  enabled: boolean;
  config: ServiceConfig;
}

export interface QuoteData {
  id: string;
  createdAt: string;
  validUntil: string;
  quoteNumber: string;
  // Klantgegevens
  clientCompany: string;
  clientContact: string;
  clientEmail: string;
  // Eigen bedrijf
  senderName: string;
  introText: string;
  // Services
  services: QuoteService[];
  // Opties
  showPrices: boolean;
  currency: 'EUR';
}

export interface ServiceDefinition {
  type: ServiceType;
  label: string;
  icon: string;
  color: string;
  tagline: string;
  description: string;
}
