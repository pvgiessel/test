import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  Calendar,
  Mail,
  Building2,
  User,
  BarChart3,
  Wrench,
  BriefcaseBusiness,
  Target,
  Check,
} from 'lucide-react';
import type { QuoteData, QuoteService } from '../types/quote';
import { calcQuoteTotals, formatCurrency, calcServiceTotal } from '../data/quoteUtils';
import { getServiceDefinition } from '../data/services';

interface Props {
  quote: QuoteData;
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  consultancy: <Target size={22} />,
  'functioneel-beheer': <Wrench size={22} />,
  payroll: <BriefcaseBusiness size={22} />,
  'horizon-bi': <BarChart3 size={22} />,
};

export function QuotePreview({ quote }: Props) {
  const navigate = useNavigate();
  const enabledServices = quote.services.filter((s) => s.enabled);
  const totals = calcQuoteTotals(quote.services);

  const validDate = new Date(quote.validUntil).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const createdDate = new Date(quote.createdAt).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Edit bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Bewerken
          </button>
          <div className="text-xs text-gray-400">Klantweergave — {quote.quoteNumber}</div>
          <button
            onClick={() => window.print()}
            className="text-sm text-afas-blue hover:text-afas-dark font-medium transition-colors"
          >
            Afdrukken / PDF
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="gradient-afas text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-blue-300 text-sm font-medium mb-2 tracking-wider uppercase">
              Offerte {quote.quoteNumber}
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
              {quote.clientCompany
                ? `Offerte voor ${quote.clientCompany}`
                : 'Uw persoonlijke offerte'}
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
              {quote.introText}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              {quote.clientContact && (
                <InfoPill icon={<User size={14} />} label={quote.clientContact} />
              )}
              {quote.clientEmail && (
                <InfoPill icon={<Mail size={14} />} label={quote.clientEmail} />
              )}
              {quote.clientCompany && (
                <InfoPill icon={<Building2 size={14} />} label={quote.clientCompany} />
              )}
              <InfoPill icon={<Calendar size={14} />} label={`Geldig t/m ${validDate}`} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">

        {enabledServices.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Geen diensten geselecteerd.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-afas-blue hover:underline text-sm"
            >
              Ga terug om diensten te selecteren →
            </button>
          </div>
        ) : (
          <>
            {/* Services */}
            <div>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-gray-900 mb-6"
              >
                Onze diensten voor u
              </motion.h2>

              <div className="space-y-4">
                {enabledServices.map((svc, i) => (
                  <ServicePreviewCard
                    key={svc.id}
                    service={svc}
                    showPrice={quote.showPrices}
                    index={i}
                  />
                ))}
              </div>
            </div>

            {/* Pricing summary */}
            {quote.showPrices && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-3xl overflow-hidden shadow-xl"
              >
                <div className="gradient-afas p-8 text-white">
                  <h2 className="text-2xl font-bold mb-1">Investeringsoverzicht</h2>
                  <p className="text-blue-200 text-sm">Excl. BTW</p>
                </div>

                <div className="bg-white p-8">
                  <div className="space-y-4">
                    {enabledServices.map((svc) => {
                      const def = getServiceDefinition(svc.config.type);
                      const { subtotal, recurring, recurringLabel } = calcServiceTotal(svc.config);
                      return (
                        <div key={svc.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{def.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{def.label}</div>
                              {recurring && (
                                <div className="text-xs text-gray-400">{recurringLabel}</div>
                              )}
                            </div>
                          </div>
                          <div className="font-semibold text-gray-900">{formatCurrency(subtotal)}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-6 border-t-2 border-gray-100 space-y-2">
                    {totals.oneTime > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Eenmalige investering</span>
                        <span className="text-xl font-bold text-gray-900">{formatCurrency(totals.oneTime)}</span>
                      </div>
                    )}
                    {totals.monthly > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Maandelijkse investering</span>
                        <span className="text-xl font-bold text-afas-blue">{formatCurrency(totals.monthly)}<span className="text-sm font-normal text-gray-400">/mnd</span></span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Why us */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl border border-gray-200 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Waarom voor ons kiezen?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {USP_LIST.map((usp) => (
                  <div key={usp.title} className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={16} className="text-afas-blue" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{usp.title}</div>
                      <div className="text-gray-500 text-sm mt-0.5">{usp.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Accept CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-3xl bg-gradient-to-br from-afas-green to-teal-600 p-8 text-white text-center"
            >
              <CheckCircle2 size={40} className="mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-2">Interesse? Laten we aan de slag gaan.</h2>
              <p className="text-white/80 mb-6 max-w-lg mx-auto">
                Neem contact op met {quote.senderName} om deze offerte te bespreken of direct te accepteren. Deze offerte is geldig t/m {validDate}.
              </p>
              {quote.clientEmail && (
                <a
                  href={`mailto:${quote.clientEmail}?subject=Akkoord op offerte ${quote.quoteNumber}`}
                  className="inline-flex items-center gap-2 bg-white text-afas-green font-semibold px-8 py-3 rounded-2xl hover:bg-green-50 transition-colors"
                >
                  <Mail size={18} />
                  Akkoord sturen
                </a>
              )}
            </motion.div>

            {/* Footer */}
            <div className="text-center text-gray-400 text-xs pb-4 space-y-1">
              <div>Offerte {quote.quoteNumber} — Aangemaakt op {createdDate} door {quote.senderName}</div>
              <div>Prijzen zijn exclusief BTW en onder voorbehoud van definitieve opdrachtbevestiging.</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 text-sm">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function ServicePreviewCard({
  service,
  showPrice,
  index,
}: {
  service: QuoteService;
  showPrice: boolean;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const def = getServiceDefinition(service.config.type);
  const { subtotal, recurring, recurringLabel } = calcServiceTotal(service.config);
  const icon = SERVICE_ICONS[service.config.type];

  const details = buildDetails(service);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div
        className="flex items-center gap-4 p-6 cursor-pointer"
        onClick={() => setExpanded((x) => !x)}
      >
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${def.color} flex items-center justify-center text-white flex-shrink-0`}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-lg">{def.label}</h3>
          <p className="text-gray-500 text-sm">{def.tagline}</p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {showPrice && (
            <div className="text-right hidden sm:block">
              <div className="font-bold text-afas-blue text-lg">{formatCurrency(subtotal)}</div>
              {recurring && <div className="text-xs text-gray-400">{recurringLabel}</div>}
            </div>
          )}
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">
              <p className="text-gray-600 text-sm leading-relaxed">{def.description}</p>

              {service.config.description && (
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                  {service.config.description}
                </div>
              )}

              {details.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {details.map((d) => (
                    <div key={d.label} className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">{d.label}</div>
                      <div className="font-semibold text-gray-900 mt-0.5">{d.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {showPrice && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-gray-500 text-sm">Subtotaal</span>
                  <span className="font-bold text-afas-blue">
                    {formatCurrency(subtotal)}
                    {recurring && <span className="text-sm font-normal text-gray-400"> {recurringLabel}</span>}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function buildDetails(service: QuoteService): { label: string; value: string }[] {
  const { config } = service;
  if (config.type === 'consultancy') {
    return [
      { label: 'Type', value: config.consultancyType },
      { label: 'Dagen', value: `${config.days} dag${config.days !== 1 ? 'en' : ''}` },
    ];
  }
  if (config.type === 'functioneel-beheer') {
    return [
      { label: 'Uren/maand', value: `${config.hoursPerMonth} uur` },
      { label: 'Looptijd', value: `${config.contractMonths} maanden` },
    ];
  }
  if (config.type === 'payroll') {
    return [
      { label: 'Medewerkers', value: `${config.employees}` },
    ];
  }
  if (config.type === 'horizon-bi') {
    return [
      { label: 'Abonnement', value: config.tier.charAt(0).toUpperCase() + config.tier.slice(1) },
      { label: 'Dashboards', value: `${config.dashboards}` },
    ];
  }
  return [];
}

const USP_LIST = [
  { title: 'AFAS-gecertificeerde consultants', body: 'Ons team bestaat uitsluitend uit gecertificeerde AFAS-specialisten.' },
  { title: 'Flexibel en schaalbaar', body: 'Onze dienstverlening past zich aan uw organisatie aan, niet andersom.' },
  { title: 'Vaste contactpersoon', body: 'U werkt altijd met één herkenbaar aanspreekpunt.' },
  { title: 'Snelle responstijden', body: 'Bij functioneel beheer garanderen wij een reactie binnen één werkdag.' },
  { title: 'Volledig AFAS-geïntegreerd', body: 'Al onze oplossingen zijn native gebouwd op of rondom AFAS Profit.' },
  { title: 'Transparante rapportage', body: 'Maandelijkse overzichten van geleverde uren, activiteiten en resultaten.' },
];
