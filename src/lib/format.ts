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

/**
 * Lager tel:-lenken fra et nummer skrevet slik folk faktisk skriver det.
 * «413 39 911» blir «+4741339911», så redaktøren slipper å tenke på landkode.
 * Er koden allerede der, i pluss- eller 00-form, beholdes den.
 */
export function telefonlenke(nr: string): string {
  const rent = nr.replace(/[^\d+]/g, '');
  if (rent.startsWith('+')) return rent;
  if (rent.startsWith('00')) return '+' + rent.slice(2);
  return rent.length === 8 ? '+47' + rent : rent;
}
