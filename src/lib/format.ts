export function kr(n?: number): string {
  if (n === undefined || n === null) return '';
  return n.toLocaleString('nb-NO').replace(/\s/g, ' ') + ' kr';
}

export function dato(d: Date): string {
  return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function datoKort(d: Date): string {
  return d.toISOString().slice(0, 10);
}
