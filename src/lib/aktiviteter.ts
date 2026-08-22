/**
 * Aktivitetstypene foreningen samler inn gjennom.
 *
 * Typen sier noe om *hvordan* pengene ble skaffet, ikke hva de gikk til.
 * Hvem som mottok dem står i `mottaker` på hvert prosjekt, og langvarige
 * engasjementer samles med `serie` (se src/pages/nepal.astro).
 *
 * Rekkefølgen her er rekkefølgen de vises i.
 */

export type Aktivitet = {
  verdi: 'konsert' | 'quiz' | 'dugnad' | 'stotte' | 'annet';
  navn: string;
  flertall: string;
  ingress: string;
  beskrivelse: string;
  farge: string;
};

export const AKTIVITETER: Aktivitet[] = [
  {
    verdi: 'konsert',
    navn: 'Konsert',
    flertall: 'Konserter',
    ingress: 'Den opprinnelige formen, og fortsatt den største.',
    beskrivelse:
      'Heart of Gold begynte som en konsert i 2001, og konserten har vært bærebjelken siden. ' +
      'Lokale musikere, sangere og dansere stiller opp uten betaling, publikum betaler i døra, ' +
      'og hele overskuddet går videre. Noen år har det vært én kveld på ungdomslokalet, andre år ' +
      'har vi vært en del av Magnordagen eller spilt i Elveparken.',
    farge: 'magenta',
  },
  {
    verdi: 'quiz',
    navn: 'Quizkveld',
    flertall: 'Quizkvelder',
    ingress: 'Lagkonkurranse med servering – dedikert til Nepal.',
    beskrivelse:
      'Quizkvelden kom til i 2018 og har blitt en fast tradisjon. Lag på inntil åtte personer, ' +
      'servering gjennom kvelden, premier fra lokale givere og et løsningsord å bryne seg på. ' +
      'Overskuddet fra quizen går til skolen og barnehjemmet i Nepal.',
    farge: 'indigo',
  },
  {
    verdi: 'dugnad',
    navn: 'Dugnad',
    flertall: 'Dugnader',
    ingress: 'Når noen lager noe eller samler inn på egen hånd.',
    beskrivelse:
      'Ikke alt skjer på en scene. Noen strikker, noen selger, noen samler inn i klassen sin. ' +
      'Strikkedugnaden ga 360 babyluer til Leger Uten Grenser, og elevene ved Finnskogen ' +
      'Montessoriskole har samlet inn til Nepal både gjennom julemarknad og egen innsats.',
    farge: 'gul',
  },
  {
    verdi: 'stotte',
    navn: 'Direkte støtte',
    flertall: 'Direkte støtte',
    ingress: 'Bidrag gitt uten et arrangement bak.',
    beskrivelse:
      'Iblant går pengene rett videre uten at det har vært en konsert eller en quiz først – ' +
      'fordi behovet dukket opp, og foreningen hadde midler.',
    farge: 'turkis',
  },
  {
    verdi: 'annet',
    navn: 'Annet arrangement',
    flertall: 'Andre arrangementer',
    ingress: 'Det som ikke passer i de andre båsene.',
    beskrivelse:
      'Pubkvelder, sammenkomster og andre påfunn som samler folk og penger.',
    farge: 'korall',
  },
];

export const finnAktivitet = (verdi: string) =>
  AKTIVITETER.find(a => a.verdi === verdi) ?? AKTIVITETER[AKTIVITETER.length - 1];
