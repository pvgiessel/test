import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import type { QuoteService } from '../types/quote';
import { getServiceDefinition } from '../data/services';
import { calcServiceTotal, formatCurrency } from '../data/quoteUtils';
import { ConsultancyForm } from './forms/ConsultancyForm';
import { FunctioneelBeheerForm } from './forms/FunctioneelBeheerForm';
import { PayrollForm } from './forms/PayrollForm';
import { HorizonBIForm } from './forms/HorizonBIForm';

interface Props {
  service: QuoteService;
  onChange: (updated: QuoteService) => void;
}

export function ServiceToggleCard({ service, onChange }: Props) {
  const def = getServiceDefinition(service.config.type);
  const { subtotal, recurringLabel } = calcServiceTotal(service.config);

  function toggle() {
    onChange({ ...service, enabled: !service.enabled });
  }

  return (
    <motion.div
      layout
      className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
        service.enabled
          ? 'border-afas-blue shadow-lg shadow-afas-blue/10 bg-white'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer select-none"
        onClick={toggle}
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${def.color} flex items-center justify-center text-2xl flex-shrink-0`}>
          {def.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-base">{def.label}</h3>
          </div>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{def.tagline}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {service.enabled && (
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-afas-blue text-sm">{formatCurrency(subtotal)}</div>
              {recurringLabel && (
                <div className="text-xs text-gray-400">{recurringLabel}</div>
              )}
            </div>
          )}

          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              service.enabled
                ? 'bg-afas-blue border-afas-blue'
                : 'border-gray-300'
            }`}
          >
            {service.enabled && <Check size={14} className="text-white" />}
          </div>

          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-300 ${service.enabled ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Expanded form */}
      <AnimatePresence>
        {service.enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-gray-100">
              {service.config.type === 'consultancy' && (
                <ConsultancyForm
                  config={service.config}
                  onChange={(config) => onChange({ ...service, config })}
                />
              )}
              {service.config.type === 'functioneel-beheer' && (
                <FunctioneelBeheerForm
                  config={service.config}
                  onChange={(config) => onChange({ ...service, config })}
                />
              )}
              {service.config.type === 'payroll' && (
                <PayrollForm
                  config={service.config}
                  onChange={(config) => onChange({ ...service, config })}
                />
              )}
              {service.config.type === 'horizon-bi' && (
                <HorizonBIForm
                  config={service.config}
                  onChange={(config) => onChange({ ...service, config })}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
