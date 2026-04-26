import type { PayrollConfig } from '../../types/quote';
import { FormField, FormRow } from './FormHelpers';

interface Props {
  config: PayrollConfig;
  onChange: (c: PayrollConfig) => void;
}

export function PayrollForm({ config, onChange }: Props) {
  const set = <K extends keyof PayrollConfig>(key: K, value: PayrollConfig[K]) =>
    onChange({ ...config, [key]: value });

  return (
    <div className="space-y-4 pt-3">
      <FormRow>
        <FormField label="Aantal medewerkers">
          <input
            type="number"
            min={1}
            step={1}
            className="form-input"
            value={config.employees}
            onChange={(e) => set('employees', parseInt(e.target.value) || 0)}
          />
        </FormField>

        <FormField label="Prijs per medewerker (€/mnd)">
          <input
            type="number"
            min={0}
            step={0.5}
            className="form-input"
            value={config.pricePerEmployee}
            onChange={(e) => set('pricePerEmployee', parseFloat(e.target.value) || 0)}
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
          placeholder="Bijv. inclusief mutatieverwerking, jaaropgaven en verzuimmeldingen..."
          value={config.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </FormField>
    </div>
  );
}
