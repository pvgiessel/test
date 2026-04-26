import type { ServiceDefinition, ServiceType } from '../types/quote';

export const SERVICE_DEFINITIONS: ServiceDefinition[] = [
  {
    type: 'consultancy',
    label: 'Consultancy',
    icon: '🎯',
    color: 'from-blue-500 to-blue-700',
    tagline: 'Kennispartner voor uw AFAS-implementatie',
    description:
      'Onze AFAS-specialisten brengen diepgaande kennis mee op het gebied van implementatie, optimalisatie en procesadvies. Van quick-scans tot volledige trajectbegeleiding.',
  },
  {
    type: 'functioneel-beheer',
    label: 'Functioneel Beheer op Afstand',
    icon: '🔧',
    color: 'from-cyan-500 to-blue-600',
    tagline: 'Altijd een expert binnen handbereik',
    description:
      'Wij nemen het functioneel beheer van uw AFAS-omgeving volledig uit handen. Flexibele urenpool, proactief beheer en snelle responstijden — zonder dat u zelf expertise hoeft op te bouwen.',
  },
  {
    type: 'payroll',
    label: 'Payroll Outsourcing',
    icon: '💼',
    color: 'from-green-500 to-teal-600',
    tagline: 'Zorgeloos salarisverwerking via AFAS',
    description:
      'Wij verzorgen de volledige salarisadministratie voor uw organisatie. Van mutatieverwerking tot jaaropgaven — volledig geïntegreerd in AFAS Profit en altijd compliant.',
  },
  {
    type: 'horizon-bi',
    label: 'Horizon BI',
    icon: '📊',
    color: 'from-violet-500 to-purple-700',
    tagline: 'Inzicht dat stuurt, niet alleen rapporteert',
    description:
      'Ons platform Horizon BI transformeert uw AFAS-data naar interactieve dashboards en stuurinformatie. Real-time inzichten voor management, HR en finance — gehost en beheerd door ons team.',
  },
];

export const CONSULTANCY_TYPES = [
  'Implementatieadvies',
  'Procesoptimalisatie',
  'Migratiebegeleiding',
  'Integratie & Koppelingen',
  'Training & Kennisoverdracht',
  'Quick Scan',
  'Project Management',
  'Technisch Advies',
];

export const HORIZON_TIERS: Record<
  'starter' | 'professional' | 'enterprise',
  { label: string; description: string; defaultFee: number; defaultSetup: number; maxDashboards: number }
> = {
  starter: {
    label: 'Starter',
    description: 'Tot 3 dashboards, standaard templates',
    defaultFee: 395,
    defaultSetup: 995,
    maxDashboards: 3,
  },
  professional: {
    label: 'Professional',
    description: 'Tot 10 dashboards, maatwerk & drill-downs',
    defaultFee: 795,
    defaultSetup: 1995,
    maxDashboards: 10,
  },
  enterprise: {
    label: 'Enterprise',
    description: 'Onbeperkt dashboards, volledige integratie & SLA',
    defaultFee: 1495,
    defaultSetup: 3995,
    maxDashboards: 999,
  },
};

export function getServiceDefinition(type: ServiceType): ServiceDefinition {
  return SERVICE_DEFINITIONS.find((s) => s.type === type)!;
}
