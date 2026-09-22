export function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function inr(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function prettyEnum(value?: string | null) {
  if (!value) return '—';
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function hourLabel(hour?: number | null) {
  if (hour == null) return '—';
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h}:00 ${suffix}`;
}

export function scaleLabel(value?: number | null, labels?: string[]) {
  if (value == null) return '—';
  return labels?.[value - 1] || `${value}/5`;
}
