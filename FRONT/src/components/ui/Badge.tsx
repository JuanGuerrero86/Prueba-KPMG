type Color = 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'gray';

interface BadgeProps {
  label: string;
  color: Color;
}

const colorClasses: Record<Color, string> = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
};

export function Badge({ label, color }: BadgeProps) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]}`}>
      {label}
    </span>
  );
}

export const prioridadColor: Record<string, Color> = {
  baja: 'green',
  media: 'yellow',
  alta: 'orange',
  critica: 'red',
};

export const estadoColor: Record<string, Color> = {
  abierto: 'blue',
  en_progreso: 'yellow',
  resuelto: 'green',
  cerrado: 'gray',
};
