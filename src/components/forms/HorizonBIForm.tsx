import type { HorizonBIConfig } from '../../types/quote';
import { HORIZON_TIERS } from '../../data/services';
import { FormField, FormRow } from './FormHelpers';

interface Props {
  config: HorizonBIConfig;
  onChange: (c: HorizonBIConfig) => void;
}

export function HorizonBIForm({ config, onChange }: Props) {
  const set = <K extends keyof HorizonBIConfig>(key: K, value: HorizonBIConfig[K]) =>
    onChange({ ...config, [key]: value });

  function selectTier(tier: HorizonBIConfig['tier']) {
    const t = HORIZON_TIERS[tier];
    onChange({ ...config, tier, monthlyFee: t.defaultFee, setupFee: t.defaultSetup });
  }

  return (
    <div className="space-y-4 pt-3">
      {/* Tier selector */}
      <FormField label="Abonnement">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(HORIZON_TIERS) as HorizonBIConfig['tier'][]).map((tier) => {
            const t = HORIZON_TIERS[tier];
            return (
              <button
                key={tier}
                type="button"
                onClick={() => selectTier(tier)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  config.tier === tier
                    ? 'border-afas-blue bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm text-gray-900">{t.label}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-tight">{t.description}</div>
              </button>
            );
          })}
        </div>
      </FormField>

      <FormRow>
        <FormField label="Aantal dashboards">
          <input
            type="number"
            min={1}
            max={HORIZON_TIERS[config.tier].maxDashboards}
            step={1}
            className="form-input"
            value={config.dashboards}
            onChange={(e) => set('dashboards', parseInt(e.target.value) || 1)}
          />
        </FormField>

        <FormField label="Maandelijks abonnement (€)">
          <input
            type="number"
            min={0}
            step={50}
            className="form-input"
            value={config.monthlyFee}
            onChange={(e) => set('monthlyFee', parseInt(e.target.value) || 0)}
          />
        </FormField>

        <FormField label="Eenmalige setup (€)">
          <input
            type="number"
            min={0}
            step={100}
            className="form-input"
            value={config.setupFee}
            onChange={(e) => set('setupFee', parseInt(e.target.value) || 0)}
          />
        </FormField>
      </FormRow>

      <FormField label="Omschrijving voor klant (optioneel)">
        <textarea
          rows={2}
          className="form-input resize-none"
          placeholder="Bijv. inclusief HR- en Finance dashboards, maandelijks onderhoud..."
          value={config.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </FormField>
    </div>
  );
}
