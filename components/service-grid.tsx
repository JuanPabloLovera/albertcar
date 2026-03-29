import { SERVICE_BUTTONS, type ServiceType } from "@/lib/types";

type Props = {
  disabled?: boolean;
  onSelect: (serviceLabel: string, serviceValue: ServiceType) => void;
};

export function ServiceGrid({ disabled = false, onSelect }: Props) {
  return (
    <div className="serviceButtons" aria-label="Servicios disponibles">
      {SERVICE_BUTTONS.map((service) => (
        <button
          key={service.value}
          type="button"
          className="serviceQuickBtn"
          onClick={() => onSelect(service.label, service.value)}
          disabled={disabled}
        >
          {service.label}
        </button>
      ))}
    </div>
  );
}
