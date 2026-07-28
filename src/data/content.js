/* ────────────────────────────────────────────────────────────────
   EDIT ME — every word on the site lives in this one file.

   A field guide to the two premier classes of circuit racing.
   Figures describe the 2026 regulations unless a year is given, and
   performance numbers are representative rather than official.
   ──────────────────────────────────────────────────────────────── */

export const site = {
  name: 'APEX',
  strapline: 'Formula 1 & MotoGP — a field guide',
  updated: '2026 season',
}

/** The credit block at the very bottom of the page. */
export const credit = {
  name: 'Swaraj Kadam',
  role: 'Built, written and designed by',
  email: 'swarajkadam0913@gmail.com',
  // Fill this in and it appears automatically; left empty it is simply not
  // rendered, rather than showing a placeholder that looks like a real number.
  phone: '',
  portfolio: 'https://swarajportfoliomain.vercel.app',
  portfolioLabel: 'swarajportfoliomain.vercel.app',
}

export const hero = {
  lineA: 'FORMULA 1',
  lineB: 'MOTOGP',
  kicker: 'Four wheels. Two wheels. One obsession.',
  blurb:
    'The rules, the machinery and the numbers behind the two fastest world championships on a race track — side by side, in plain language.',
  facts: [
    { k: 'F1 since', v: '1950' },
    { k: 'MotoGP since', v: '1949' },
    { k: 'Rounds in 2026', v: '24 · 22' },
  ],
}

/* ── 01 · the Formula 1 car ─────────────────────────────────── */

export const f1 = {
  id: 'f1',
  eyebrow: 'Chapter 01 — Four wheels',
  heading: 'The Formula 1 car',
  lede: 'A 768 kg carbon monocoque with roughly a thousand horsepower, half of it electric, and enough downforce to out-grip its own weight several times over.',
  body: [
    'The 2026 regulations split the power unit almost evenly between a 1.6-litre V6 turbo engine and an electric motor rated at 350 kW. The MGU-H — the heat-recovery motor spun by the turbo — is gone, which makes the units simpler, cheaper and far easier for a new manufacturer to build.',
    'The cars are smaller than the generation before them: a shorter wheelbase, a narrower body, and around thirty per cent less downforce. To claw back the lap time the wings now move. Drivers switch between a low-drag straight-line mode and a high-downforce cornering mode, and an electrical Manual Override gives the car behind a burst of extra energy instead of DRS.',
  ],
  specs: [
    { label: 'Power unit', value: '1.6 L V6 turbo hybrid' },
    { label: 'Combined output', value: '≈ 1000 hp' },
    { label: 'Electric share', value: '350 kW · ~50%' },
    { label: 'Fuel', value: '100% sustainable' },
    { label: 'Minimum weight', value: '768 kg with driver' },
    { label: 'Tyres', value: 'Pirelli 18-inch slicks' },
    { label: 'Gearbox', value: '8-speed semi-automatic' },
    { label: 'Race distance', value: '≥ 305 km' },
  ],
  anatomy: [
    {
      part: 'Front wing',
      note: 'Sets up every airflow structure behind it. In 2026 the flaps move, trimming drag on the straight.',
    },
    {
      part: 'Floor & diffuser',
      note: 'The real downforce factory. Ground effect tunnels seal the floor to the track and suck the car down.',
    },
    {
      part: 'Energy store',
      note: 'A battery pack under the fuel cell, harvesting under braking and deploying up to 350 kW.',
    },
    {
      part: 'Halo',
      note: 'Titanium cockpit protection, mandatory since 2018, tested to withstand a loaded double-decker bus.',
    },
  ],
}

/* ── 02 · the MotoGP bike ───────────────────────────────────── */

export const motogp = {
  id: 'motogp',
  eyebrow: 'Chapter 02 — Two wheels',
  heading: 'The MotoGP prototype',
  lede: 'A 157 kg prototype with close to 300 hp, no traction beyond two contact patches the size of a phone screen, and a rider who leans it to 64 degrees to keep it there.',
  body: [
    'Nothing on a MotoGP grid can be bought. Every bike is a purpose-built prototype: a 1000 cc four-cylinder engine limited to an 81 mm bore, a carbon chassis fairing bolted to an aluminium or carbon frame, seamless-shift gearboxes and brake discs that glow orange into a heavy stop.',
    'Where an F1 car makes grip with air pressing it into the road, a bike makes it with geometry and courage. Winglets add downforce to stop the front wheel lifting; a rear ride-height device squats the bike on the launch and out of slow corners. From 2027 the class drops to 850 cc, the devices are banned outright, and the aerodynamics get pulled back.',
  ],
  specs: [
    { label: 'Engine', value: '1000 cc, max 4 cylinders' },
    { label: 'Peak output', value: '≈ 290 hp' },
    { label: 'Maximum bore', value: '81 mm' },
    { label: 'Fuel', value: '22 L race · 40% non-fossil' },
    { label: 'Minimum weight', value: '157 kg, bike only' },
    { label: 'Tyres', value: 'Michelin 17-inch slicks' },
    { label: 'Gearbox', value: '6-speed seamless shift' },
    { label: 'Race distance', value: '≈ 110–120 km' },
  ],
  anatomy: [
    {
      part: 'Aero fairing',
      note: 'Winglets fight the wheelie and settle the front on the brakes. One update per manufacturer per season.',
    },
    {
      part: 'Ride-height device',
      note: 'Mechanically squats the rear on launch and corner exit. Outlawed from 2027.',
    },
    {
      part: 'Carbon brakes',
      note: '340–355 mm discs running past 800 °C. Useless until the rider has heated them on the out lap.',
    },
    {
      part: 'Contact patch',
      note: 'Two palm-sized patches carry braking, cornering and drive. At 64° of lean, the edge of the tyre is doing all of it.',
    },
  ],
}

/* ── 03 · head to head ──────────────────────────────────────── */

export const compare = {
  eyebrow: 'Chapter 03 — Head to head',
  heading: 'Car versus bike',
  note: 'Bars are scaled to the larger of the two figures. Values are representative of a dry race weekend.',
  rows: [
    { label: 'Top speed', unit: 'km/h', f1: 360, gp: 366, max: 380 },
    { label: 'Peak power', unit: 'hp', f1: 1000, gp: 290, max: 1000 },
    { label: 'Mass', unit: 'kg', f1: 768, gp: 157, max: 800 },
    { label: 'Power to weight', unit: 'hp/kg', f1: 1.3, gp: 1.85, max: 2 },
    { label: '0–100 km/h', unit: 's', f1: 2.6, gp: 2.6, max: 3 },
    { label: 'Peak braking', unit: 'g', f1: 6, gp: 1.6, max: 6 },
    { label: 'Peak cornering', unit: 'g', f1: 5.5, gp: 1.6, max: 6 },
    { label: 'Race distance', unit: 'km', f1: 305, gp: 115, max: 320 },
    { label: 'Race duration', unit: 'min', f1: 90, gp: 42, max: 95 },
  ],
  headline: [
    {
      k: 'The car wins the corner',
      v: 'Downforce lets an F1 car turn at more than five times gravity. A bike is limited to roughly 1.6 g, because past that the tyres simply let go.',
    },
    {
      k: 'The bike wins the ratio',
      v: 'Fewer than 300 horsepower, but only 157 kg to carry. Per kilo, the prototype out-punches the car — which is why the two reach nearly the same top speed.',
    },
    {
      k: 'The stopwatch is not close',
      v: 'Around a shared circuit such as Silverstone or the Red Bull Ring, an F1 car is comfortably 25–30 seconds a lap faster.',
    },
  ],
}

/* ── 04 · the race weekend ──────────────────────────────────── */

export const weekend = {
  eyebrow: 'Chapter 04 — The weekend',
  heading: 'How a Grand Prix runs',
  columns: [
    {
      series: 'Formula 1',
      tone: 'f1',
      schedule: [
        { day: 'Friday', items: ['Practice 1 — 60 min', 'Practice 2 — 60 min'] },
        { day: 'Saturday', items: ['Practice 3 — 60 min', 'Qualifying — Q1 / Q2 / Q3'] },
        { day: 'Sunday', items: ['Grand Prix — 305 km or 2 hours'] },
      ],
      qualifying:
        'Q1 runs 18 minutes and drops the slowest five. Q2 runs 15 and drops five more. Q3 is 12 minutes for the top ten and pole position.',
      sprint:
        'Six rounds add a sprint: one practice session, a separate sprint qualifying, a 100 km sprint on Saturday, then normal qualifying and the Grand Prix.',
      points: [
        { pos: 'Race', list: '25 · 18 · 15 · 12 · 10 · 8 · 6 · 4 · 2 · 1' },
        { pos: 'Sprint', list: '8 · 7 · 6 · 5 · 4 · 3 · 2 · 1' },
      ],
    },
    {
      series: 'MotoGP',
      tone: 'gp',
      schedule: [
        { day: 'Friday', items: ['Free Practice 1 — 45 min', 'Practice — 60 min, sets Q2 entry'] },
        { day: 'Saturday', items: ['Free Practice 2 — 30 min', 'Q1 / Q2', 'Sprint — half distance'] },
        { day: 'Sunday', items: ['Warm-up — 10 min', 'Grand Prix — 110–120 km'] },
      ],
      qualifying:
        "Friday's combined times send the fastest ten straight to Q2. Everyone else fights through Q1, where the top two are promoted.",
      sprint:
        'Every round has a Saturday sprint over half race distance, with no compulsory pit stops and points down to ninth.',
      points: [
        { pos: 'Race', list: '25 · 20 · 16 · 13 · 11 · 10 · 9 · 8 · 7 · 6 …' },
        { pos: 'Sprint', list: '12 · 9 · 7 · 6 · 5 · 4 · 3 · 2 · 1' },
      ],
    },
  ],
  flags: [
    { flag: 'Yellow', meaning: 'Danger ahead. Slow down, no overtaking.' },
    { flag: 'Red', meaning: 'Session stopped. Return to the pit lane.' },
    { flag: 'Blue', meaning: 'Faster car or rider behind, about to lap you.' },
    { flag: 'Black & white', meaning: 'Warning for unsporting driving or track limits.' },
    { flag: 'Chequered', meaning: 'Session over. One slow lap back to the pits.' },
  ],
}

/* ── 05 · circuits ──────────────────────────────────────────── */

export const circuits = {
  eyebrow: 'Chapter 05 — The map',
  heading: 'Where they race',
  note: 'A handful of venues host both championships. Most belong firmly to one.',
  list: [
    {
      name: 'Spa-Francorchamps',
      country: 'Belgium',
      km: '7.004',
      corners: 19,
      series: ['F1', 'MotoGP'],
      note: 'The longest lap on either calendar. Eau Rouge and Raidillon are taken flat in an F1 car and are anything but flat on a bike.',
    },
    {
      name: 'Monza',
      country: 'Italy',
      km: '5.793',
      corners: 11,
      series: ['F1'],
      note: 'The Temple of Speed. Cars run their skinniest wings of the year and spend three-quarters of the lap at full throttle.',
    },
    {
      name: 'Mugello',
      country: 'Italy',
      km: '5.245',
      corners: 15,
      series: ['MotoGP'],
      note: 'A 1.1 km downhill straight where the outright MotoGP speed record — 366.1 km/h — was set in 2023.',
    },
    {
      name: 'Silverstone',
      country: 'United Kingdom',
      km: '5.891',
      corners: 18,
      series: ['F1', 'MotoGP'],
      note: 'Fast, open and old. Maggotts–Becketts–Chapel is the finest sequence of high-speed direction changes in racing.',
    },
    {
      name: 'Phillip Island',
      country: 'Australia',
      km: '4.448',
      corners: 12,
      series: ['MotoGP'],
      note: 'Sea on three sides, barely a slow corner anywhere, and a wind that rewrites the braking points between sessions.',
    },
    {
      name: 'Circuit of the Americas',
      country: 'United States',
      km: '5.513',
      corners: 20,
      series: ['F1', 'MotoGP'],
      note: 'A blind, steeply climbing first corner, then a stolen copy of half of Europe’s best sequences.',
    },
    {
      name: 'Assen',
      country: 'Netherlands',
      km: '4.542',
      corners: 18,
      series: ['MotoGP'],
      note: 'The Cathedral. The only venue to have appeared on every world championship calendar since 1949.',
    },
    {
      name: 'Monaco',
      country: 'Monaco',
      km: '3.337',
      corners: 19,
      series: ['F1'],
      note: 'Barriers instead of run-off, a swimming pool, and a race distance cut to 260 km because the lap is so short.',
    },
  ],
}

/* ── 06 · eras ──────────────────────────────────────────────── */

export const eras = {
  eyebrow: 'Chapter 06 — Lap chart',
  heading: 'How they got here',
  entries: [
    {
      period: '1949 — 1950',
      org: 'Both',
      title: 'Two championships begin',
      detail:
        'The FIM crowns its first road racing world champions in 1949. A year later thirteen cars line up at Silverstone for the first Formula 1 World Championship race.',
    },
    {
      period: '1960s — 1970s',
      org: 'Formula 1',
      title: 'Wings, then ground effect',
      detail:
        'Aerodynamics arrive on stilts in 1968 and are quickly regulated. A decade later Lotus discovers the underbody tunnel, and cornering speed changes for good.',
    },
    {
      period: '1970s — 1980s',
      org: 'Grand Prix bikes',
      title: 'The two-stroke 500s',
      detail:
        'Screaming, unforgiving 500 cc two-strokes define the premier class, and a generation of dirt-track riders arrives to teach everyone how to slide them.',
    },
    {
      period: '1980s',
      org: 'Formula 1',
      title: 'The turbo era',
      detail:
        'Qualifying engines pass 1400 hp for a single flying lap before fuel limits and, eventually, an outright ban end the experiment.',
    },
    {
      period: '1994',
      org: 'Formula 1',
      title: 'Imola, and everything after',
      detail:
        'The deaths of Roland Ratzenberger and Ayrton Senna trigger the deepest safety overhaul in the sport’s history — and a culture that has never stopped iterating on it.',
    },
    {
      period: '2002 — 2012',
      org: 'MotoGP',
      title: 'Four-strokes, and a name change',
      detail:
        'The 500 cc class becomes MotoGP with 990 cc four-strokes, shrinks to 800 cc in 2007, and settles at the 1000 cc formula still raced today.',
    },
    {
      period: '2014',
      org: 'Formula 1',
      title: 'Hybrids take over',
      detail:
        'V8s give way to 1.6-litre V6 turbo-hybrids. Thermal efficiency passes 50%, a figure no road car engine had come close to.',
    },
    {
      period: '2023',
      org: 'MotoGP',
      title: 'Saturday matters',
      detail:
        'A sprint race is added to every round, roughly doubling the number of racing starts in a season and the points on offer for them.',
    },
    {
      period: '2026 — 2027',
      org: 'Both',
      title: 'The next reset',
      detail:
        'F1 moves to a 50% electric power unit, active aerodynamics and an eleventh team. MotoGP drops to 850 cc in 2027, with ride-height devices banned and aero cut back.',
    },
  ],
}

/* ── 07 · glossary ──────────────────────────────────────────── */

export const glossary = {
  eyebrow: 'Chapter 07 — Vocabulary',
  heading: 'Learn the language',
  terms: [
    {
      term: 'Slipstream / tow',
      tone: 'both',
      def: 'Running in the hole another machine punches in the air. Worth several km/h on a straight and a chunk of a lap in qualifying.',
    },
    {
      term: 'Manual Override',
      tone: 'f1',
      def: 'The 2026 replacement for DRS. A chasing car within one second gets extra electrical deployment at high speed instead of an opening rear wing.',
    },
    {
      term: 'Undercut',
      tone: 'f1',
      def: 'Pitting before the car ahead and using fresh tyres to be in front when they stop. The overcut does the opposite — stay out and go faster on clear track.',
    },
    {
      term: 'Parc fermé',
      tone: 'f1',
      def: 'From the start of qualifying the car is frozen. Change anything significant and you start from the pit lane.',
    },
    {
      term: 'Long lap penalty',
      tone: 'gp',
      def: 'A marked detour outside a corner that costs a rider a few seconds without stopping the race. MotoGP’s answer to the drive-through.',
    },
    {
      term: 'Holeshot device',
      tone: 'gp',
      def: 'A mechanism that compresses the suspension at the start, lowering the bike so it launches without flipping over backwards.',
    },
    {
      term: 'Flag-to-flag',
      tone: 'gp',
      def: 'When the weather turns mid-race, riders swap to a second bike on the correct tyres rather than the race being stopped.',
    },
    {
      term: 'Tyre compounds',
      tone: 'both',
      def: 'Soft rubber is quick and short-lived, hard rubber the reverse. Choosing between them is most of race strategy in both series.',
    },
    {
      term: 'Concessions',
      tone: 'gp',
      def: 'A sliding scale of extra testing, engines and aero updates handed to manufacturers who score poorly, to keep the grid from stagnating.',
    },
    {
      term: 'Track limits',
      tone: 'both',
      def: 'The white line is the edge of the track. Put all four wheels — or both — beyond it and the lap is deleted.',
    },
  ],
  sources: [
    { label: 'FIA — F1 regulations', href: 'https://www.fia.com/regulation/category/110' },
    { label: 'Formula1.com', href: 'https://www.formula1.com/' },
    { label: 'FIM road racing', href: 'https://www.fim-moto.com/' },
    { label: 'MotoGP.com', href: 'https://www.motogp.com/' },
  ],
}

/* ── chrome ─────────────────────────────────────────────────── */

export const nav = [
  { id: 'hero', label: 'Index', code: '00' },
  { id: 'f1', label: 'The car', code: '01' },
  { id: 'motogp', label: 'The bike', code: '02' },
  { id: 'compare', label: 'Head to head', code: '03' },
  { id: 'weekend', label: 'Weekend', code: '04' },
  { id: 'circuits', label: 'Circuits', code: '05' },
  { id: 'eras', label: 'History', code: '06' },
  { id: 'glossary', label: 'Glossary', code: '07' },
]

export const marqueeWords = [
  'FORMULA 1',
  'MOTOGP',
  '1000 HP',
  '64° OF LEAN',
  'GROUND EFFECT',
  'SEAMLESS SHIFT',
  '366 KM/H',
  'SUSTAINABLE FUEL',
]
