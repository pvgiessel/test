import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, RefreshCw } from 'lucide-react';
import type { QuoteData, QuoteService } from '../types/quote';
import { ServiceToggleCard } from '../components/ServiceToggleCard';
import { calcQuoteTotals, formatCurrency, createDefaultQuote } from '../data/quoteUtils';

interface Props {
  quote: QuoteData;
  setQuote: (q: QuoteData) => void;
}

export function QuoteBuilder({ quote, setQuote }: Props) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'client' | 'services' | 'settings'>('client');

  const totals = calcQuoteTotals(quote.services);
  const enabledCount = quote.services.filter((s) => s.enabled).length;

  function updateService(updated: QuoteService) {
    setQuote({
      ...quote,
      services: quote.services.map((s) => (s.id === updated.id ? updated : s)),
    });
  }

  function resetQuote() {
    if (confirm('Weet u zeker dat u de offerte wilt resetten?')) {
      setQuote(createDefaultQuote());
      setActiveTab('client');
    }
  }

  const tabs = [
    { id: 'client' as const, label: 'Klantgegevens', step: '1' },
    { id: 'services' as const, label: 'Diensten', step: '2' },
    { id: 'settings' as const, label: 'Instellingen', step: '3' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-afas flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">AFAS Offerte</span>
              <span className="text-gray-400 text-xs ml-2">{quote.quoteNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetQuote}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Reset offerte"
            >
              <RefreshCw size={16} />
            </button>

            <button
              onClick={() => navigate('/preview')}
              className="flex items-center gap-2 bg-afas-blue text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-afas-dark transition-colors"
            >
              Bekijk offerte
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Tab nav */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-200 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-afas-blue text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                }`}
              >
                {tab.step}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'client' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <SectionCard title="Klantgegevens" subtitle="Vul de gegevens van uw klant in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput
                  label="Bedrijfsnaam"
                  value={quote.clientCompany}
                  onChange={(v) => setQuote({ ...quote, clientCompany: v })}
                  placeholder="Acme B.V."
                />
                <LabeledInput
                  label="Contactpersoon"
                  value={quote.clientContact}
                  onChange={(v) => setQuote({ ...quote, clientContact: v })}
                  placeholder="Jan Jansen"
                />
                <LabeledInput
                  label="E-mailadres"
                  type="email"
                  value={quote.clientEmail}
                  onChange={(v) => setQuote({ ...quote, clientEmail: v })}
                  placeholder="j.jansen@acme.nl"
                />
                <LabeledInput
                  label="Uw naam / afdeling"
                  value={quote.senderName}
                  onChange={(v) => setQuote({ ...quote, senderName: v })}
                  placeholder="AFAS Sales Team"
                />
              </div>
            </SectionCard>

            <SectionCard title="Introductietekst" subtitle="Persoonlijk welkomstbericht voor de klant">
              <textarea
                rows={4}
                className="form-input w-full resize-none"
                value={quote.introText}
                onChange={(e) => setQuote({ ...quote, introText: e.target.value })}
                placeholder="Hartelijk dank voor uw interesse..."
              />
            </SectionCard>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveTab('services')}
                className="flex items-center gap-2 bg-afas-blue text-white px-6 py-3 rounded-xl font-medium hover:bg-afas-dark transition-colors"
              >
                Volgende: Diensten
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'services' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-semibold text-gray-900">Selecteer diensten</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Activeer de diensten die u wilt opnemen en configureer de details.
                </p>
              </div>
              {enabledCount > 0 && (
                <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  {enabledCount} {enabledCount === 1 ? 'dienst' : 'diensten'} geselecteerd
                </div>
              )}
            </div>

            {quote.services.map((svc) => (
              <ServiceToggleCard key={svc.id} service={svc} onChange={updateService} />
            ))}

            {/* Summary */}
            {enabledCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl gradient-afas text-white p-6"
              >
                <h3 className="font-semibold text-lg mb-4">Indicatief totaaloverzicht</h3>
                <div className="grid grid-cols-2 gap-6">
                  {totals.oneTime > 0 && (
                    <div>
                      <div className="text-blue-200 text-sm">Eenmalig</div>
                      <div className="text-2xl font-bold">{formatCurrency(totals.oneTime)}</div>
                    </div>
                  )}
                  {totals.monthly > 0 && (
                    <div>
                      <div className="text-blue-200 text-sm">Per maand</div>
                      <div className="text-2xl font-bold">{formatCurrency(totals.monthly)}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setActiveTab('client')}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Terug
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-2 bg-afas-blue text-white px-6 py-3 rounded-xl font-medium hover:bg-afas-dark transition-colors"
              >
                Volgende: Instellingen
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <SectionCard title="Offerte-instellingen" subtitle="Geldigheidsdatum en weergave-opties">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput
                  label="Geldig tot"
                  type="date"
                  value={quote.validUntil.slice(0, 10)}
                  onChange={(v) => setQuote({ ...quote, validUntil: v })}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prijzen tonen
                  </label>
                  <div className="flex items-center gap-3 h-10">
                    <button
                      onClick={() => setQuote({ ...quote, showPrices: true })}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        quote.showPrices
                          ? 'border-afas-blue bg-blue-50 text-afas-blue'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      Ja
                    </button>
                    <button
                      onClick={() => setQuote({ ...quote, showPrices: false })}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        !quote.showPrices
                          ? 'border-afas-blue bg-blue-50 text-afas-blue'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      Nee
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setActiveTab('services')}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Terug
              </button>
              <button
                onClick={() => navigate('/preview')}
                className="flex items-center gap-2 bg-afas-blue text-white px-6 py-3 rounded-xl font-medium hover:bg-afas-dark transition-colors"
              >
                Offerte bekijken
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
