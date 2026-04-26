import type { FunctioneelBeheerConfig } from '../../types/quote';
import { FormField, FormRow } from './FormHelpers';

interface Props {
  config: FunctioneelBeheerConfig;
  onChange: (c: FunctioneelBeheerConfig) => void;
}

export function FunctioneelBeheerForm({ config, onChange }: Props) {
  const set = <K extends keyof FunctioneelBeheerConfig>(key: K, value: FunctioneelBeheerConfig[K]) =>
    onChange({ ...config, [key]: value });

  return (
    <div className="space-y-4 pt-3">
      <FormRow>
        <FormField label="Uren per maand">
          <input
            type="number"
            min={1}
            step={1}
            className="form-input"
            value={config.hoursPerMonth}
            onChange={(e) => set('hoursPerMonth', parseInt(e.target.value) || 0)}
          />
        </FormField>

        <FormField label="Uurtarief (€)">
          <input
            type="number"
            min={0}
            step={5}
            className="form-input"
            value={config.hourlyRate}
            onChange={(e) => set('hourlyRate', parseInt(e.target.value) || 0)}
          />
        </FormField>

        <FormField label="Looptijd (maanden)">
          <select
            className="form-select"
            value={config.contractMonths}
            onChange={(e) => set('contractMonths', parseInt(e.target.value))}
          >
            {[3, 6, 12, 24].map((m) => (
              <option key={m} value={m}>{m} maanden</option>
            ))}
          </select>
        </FormField>
      </FormRow>

      <FormField label="Omschrijving voor klant (optioneel)">
        <textarea
          rows={2}
          className="form-input resize-none"
          placeholder="Bijv. inclusief maandelijks overleg en proactief monitoren..."
          value={config.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </FormField>
    </div>
  );
}
