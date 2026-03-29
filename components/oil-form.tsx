import type { ChangeEvent, FormEvent, InputHTMLAttributes } from "react";

import type { OilForm } from "@/lib/types";
import { brandOptions, getModelOptions, motorOptions } from "@/lib/vehicle-catalog";

type Props = {
  formData: OilForm;
  disabled?: boolean;
  onChange: (field: keyof OilForm, value: string) => void;
  onSubmit: () => void;
};

type BaseField = {
  key: keyof OilForm;
  label: string;
  placeholder?: string;
  full?: boolean;
  required?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  helperText?: string;
};

type TextField = BaseField & {
  kind?: "text" | "datalist";
  options?: string[];
};

type SelectField = BaseField & {
  kind: "select";
  options: Array<{ label: string; value: string }>;
};

type FieldConfig = TextField | SelectField;

const fuelOptions = [
  { label: "Selecciona combustible", value: "" },
  { label: "Bencina", value: "Bencina" },
  { label: "Diésel", value: "Diésel" },
  { label: "Híbrido", value: "Híbrido" },
  { label: "Híbrido enchufable", value: "Híbrido enchufable" },
  { label: "GLP / Gas", value: "GLP / Gas" },
  { label: "Eléctrico", value: "Eléctrico" },
];

const fields: FieldConfig[] = [
  {
    key: "nombre",
    label: "Nombre",
    placeholder: "Ej: Juan Pérez",
    helperText: "Ingresa tu nombre para enviarte la recomendación.",
  },
  {
    key: "telefono",
    label: "Teléfono",
    placeholder: "Ej: 9 1234 5678",
    inputMode: "tel",
    helperText: "Puedes escribir solo números o con espacios.",
  },
  {
    key: "patente",
    label: "Patente",
    placeholder: "Ej: ABCD12",
    helperText: "Ejemplo chileno sin guiones.",
  },
  {
    key: "marca",
    label: "Marca",
    placeholder: "Ej: Toyota",
    kind: "datalist",
    options: [...brandOptions],
    helperText: "Puedes escribir o elegir una marca sugerida.",
    required: true,
  },
  {
    key: "modelo",
    label: "Modelo",
    placeholder: "Ej: Yaris",
    kind: "datalist",
    helperText: "Primero elige la marca y luego selecciona o escribe el modelo.",
    required: true,
  },
  {
    key: "anio",
    label: "Año",
    placeholder: "Ej: 2019",
    inputMode: "numeric",
    helperText: "Usa 4 dígitos.",
    required: true,
  },
  {
    key: "motor",
    label: "Motor",
    placeholder: "Ej: 1.5",
    full: true,
    kind: "datalist",
    options: [...motorOptions],
    helperText: "Puedes indicar cilindrada o versión, por ejemplo 1.5 o 2.0 Turbo.",
  },
  {
    key: "kilometraje",
    label: "Kilometraje",
    placeholder: "Ej: 85000",
    inputMode: "numeric",
    helperText: "Escribe el kilometraje aproximado actual.",
    required: true,
  },
  {
    key: "combustible",
    label: "Combustible",
    kind: "select",
    options: fuelOptions,
    full: true,
    helperText: "Elige el tipo de combustible para afinar la recomendación.",
    required: true,
  },
];

export function OilFormCard({ formData, disabled = false, onChange, onSubmit }: Props) {
  const brandDrivenModelOptions = getModelOptions(formData.marca);
  const modelHint = formData.marca
    ? brandDrivenModelOptions.length
      ? `Sugerencias para ${formData.marca}: ${brandDrivenModelOptions.slice(0, 3).join(", ")}... Puedes escribir otro modelo si no aparece.`
      : `No hay sugerencias cargadas para ${formData.marca}. Puedes escribir el modelo manualmente.`
    : "Primero elige la marca y luego selecciona o escribe el modelo.";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="formCard" onSubmit={handleSubmit} noValidate>
      <div className="small" style={{ marginBottom: 10 }}>
        Complete los datos para recomendar aceite y filtro. Los campos marcados con * son obligatorios.
      </div>

      <div className="formGrid">
        {fields.map((field) => {
          const inputId = `field-${field.key}`;
          const helperId = `${inputId}-hint`;
          const fieldOptions =
            field.key === "modelo" && field.kind === "datalist"
              ? brandDrivenModelOptions
              : field.kind === "datalist"
                ? field.options
                : undefined;
          const datalistId = field.kind === "datalist" ? `${inputId}-options` : undefined;
          const helperText = field.key === "modelo" ? modelHint : field.helperText;

          return (
            <div key={field.key} className={field.full ? "full fieldGroup" : "fieldGroup"}>
              <label className="fieldLabel" htmlFor={inputId}>
                {field.label}
                {field.required ? " *" : ""}
              </label>

              {field.kind === "select" ? (
                <select
                  id={inputId}
                  className="textInput textSelect"
                  aria-label={field.label}
                  aria-describedby={helperText ? helperId : undefined}
                  aria-required={field.required}
                  value={formData[field.key]}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(field.key, event.target.value)}
                  disabled={disabled}
                  required={field.required}
                >
                  {field.options.map((option) => (
                    <option key={`${field.key}-${option.value || "empty"}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    id={inputId}
                    className="textInput"
                    placeholder={field.placeholder}
                    aria-label={field.label}
                    aria-describedby={helperText ? helperId : undefined}
                    aria-required={field.required}
                    value={formData[field.key]}
                    inputMode={field.inputMode}
                    list={datalistId}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(field.key, event.target.value)}
                    disabled={disabled}
                    required={field.required}
                  />
                  {field.kind === "datalist" ? (
                    <datalist id={datalistId}>
                      {(fieldOptions ?? []).map((option) => (
                        <option key={`${field.key}-${option}`} value={option} />
                      ))}
                    </datalist>
                  ) : null}
                </>
              )}

              {helperText ? (
                <span id={helperId} className="fieldHint">
                  {helperText}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="small" style={{ marginTop: 10 }}>
        Privacidad: para seguimiento interno se recomienda guardar datos sensibles en formato reducido o anonimizado.
      </div>

      <div className="ctaRow">
        <button type="submit" className="sendBtn" disabled={disabled}>
          {disabled ? "Enviando..." : "Enviar datos"}
        </button>
      </div>
    </form>
  );
}
