import type { ConsultancyConfig } from '../../types/quote';
import { CONSULTANCY_TYPES } from '../../data/services';
import { FormField, FormRow } from './FormHelpers';

interface Props {
  config: ConsultancyConfig;
  onChange: (c: ConsultancyConfig) => void;
}

export function ConsultancyForm({ config, onChange }: Props) {
  const set = <K extends keyof ConsultancyConfig>(key: K, value: ConsultancyConfig[K]) =>
    onChange({ ...config, [key]: value });

  return (
    <div className="space-y-4 pt-3">
      <FormRow>
        <FormField label="Type consultancy">
          <select
            className="form-select"
            value={config.consultancyType}
            onChange={(e) => set('consultancyType', e.target.value)}
          >
            {CONSULTANCY_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Aantal dagen">
          <input
            type="number"
            min={0.5}
            step={0.5}
            className="form-input"
            value={config.days}
            onChange={(e) => set('days', parseFloat(e.target.value) || 0)}
          />
        </FormField>

        <FormField label="Dagtarief (€)">
          <input
            type="number"
            min={0}
            step={50}
            className="form-input"
            value={config.dailyRate}
            onChange={(e) => set('dailyRate', parseInt(e.target.value) || 0)}
          />
        </FormField>
      </FormRow>

      <FormField label="Omschrijving voor klant (optioneel)">
        <textarea
          rows={2}
          className="form-input resize-none"
          placeholder="Bijv. inclusief voorbereiding en rapportage..."
          value={config.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </FormField>
    </div>
  );
}
