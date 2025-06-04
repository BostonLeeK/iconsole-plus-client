interface DataCardProps {
  title: string;
  value: string | number;
  unit?: string;
  className?: string;
}

export function DataCard(props: DataCardProps) {
  return (
    <div class={`data-card ${props.className || ""}`}>
      <h3 class="text-lg font-medium text-gray-900 mb-2">{props.title}</h3>
      <div class="data-value">
        <span class="text-3xl font-bold text-gray-900">{props.value}</span>
        {props.unit && <span class="unit">{props.unit}</span>}
      </div>
    </div>
  );
}
