import type { QuoteData, QuoteService, ServiceConfig } from '../types/quote';

export function calcServiceTotal(config: ServiceConfig): { subtotal: number; recurring: boolean; recurringLabel?: string } {
  switch (config.type) {
    case 'consultancy':
      return { subtotal: config.days * config.dailyRate, recurring: false };
    case 'functioneel-beheer':
      return {
        subtotal: config.hoursPerMonth * config.hourlyRate,
        recurring: true,
        recurringLabel: 'per maand',
      };
    case 'payroll':
      return {
        subtotal: config.employees * config.pricePerEmployee + config.setupFee,
        recurring: true,
        recurringLabel: 'per maand (incl. eenmalige setup)',
      };
    case 'horizon-bi':
      return {
        subtotal: config.monthlyFee + config.setupFee,
        recurring: true,
        recurringLabel: 'per maand (incl. eenmalige setup)',
      };
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
}

export function calcQuoteTotals(services: QuoteService[]) {
  const enabled = services.filter((s) => s.enabled);
  let oneTime = 0;
  let monthly = 0;

  for (const svc of enabled) {
    const { config } = svc;
    if (config.type === 'consultancy') {
      oneTime += config.days * config.dailyRate;
    } else if (config.type === 'functioneel-beheer') {
      monthly += config.hoursPerMonth * config.hourlyRate;
    } else if (config.type === 'payroll') {
      oneTime += config.setupFee;
      monthly += config.employees * config.pricePerEmployee;
    } else if (config.type === 'horizon-bi') {
      oneTime += config.setupFee;
      monthly += config.monthlyFee;
    }
  }

  return { oneTime, monthly };
}

export function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `OFF-${year}-${rand}`;
}

export function createDefaultQuote(): QuoteData {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    quoteNumber: generateQuoteNumber(),
    clientCompany: '',
    clientContact: '',
    clientEmail: '',
    senderName: 'Uw AFAS Partner',
    introText:
      'Hartelijk dank voor uw interesse in onze dienstverlening. Met veel plezier presenteren wij u deze offerte op maat. Onze specialisten staan klaar om u optimaal te ondersteunen bij uw AFAS-ambities.',
    services: [
      {
        id: crypto.randomUUID(),
        enabled: false,
        config: {
          type: 'consultancy',
          consultancyType: 'Implementatieadvies',
          days: 5,
          dailyRate: 1250,
          description: '',
        },
      },
      {
        id: crypto.randomUUID(),
        enabled: false,
        config: {
          type: 'functioneel-beheer',
          hoursPerMonth: 8,
          hourlyRate: 115,
          contractMonths: 12,
          description: '',
        },
      },
      {
        id: crypto.randomUUID(),
        enabled: false,
        config: {
          type: 'payroll',
          employees: 50,
          pricePerEmployee: 12,
          setupFee: 1500,
          description: '',
        },
      },
      {
        id: crypto.randomUUID(),
        enabled: false,
        config: {
          type: 'horizon-bi',
          tier: 'professional',
          dashboards: 5,
          monthlyFee: 795,
          setupFee: 1995,
          description: '',
        },
      },
    ],
    showPrices: true,
    currency: 'EUR',
  };
}
