export const LANDING_SITE_DATA = {
  curiosity: {
    id: 'curiosity',
    label: 'Curiosity Landing Site',
    title: 'Gale Crater',
    lat: -4.5895,
    lon: 137.4417,
    description:
      'Curiosity landed in Gale Crater in 2012 and began a long scientific campaign to assess whether Mars ever had habitable environments.',
    facts: [
      'Curiosity touched down on August 6, 2012, using a sky crane landing system.',
      'Gale Crater is a 96-mile-wide impact basin with a layered mountain called Aeolis Mons at its center.',
      'The rover was designed to study whether ancient Mars had the chemical ingredients for life.',
    ],
    hazards: [
      'Dust accumulation can reduce solar power and interfere with rover systems.',
      'Rock fields, sand ripples, and steep slopes create navigation and wheel-wear risks.',
      'Seasonal dust storms can reduce atmospheric clarity and create electromagnetic stress.',
    ],
    minerals: [
      'Clay minerals formed in water-rich conditions',
      'Hematite and iron-rich minerals indicating oxidation and water interaction',
      'Silica-rich deposits and sulfate minerals associated with past chemical environments',
    ],
    nasa: {
      rover: 'curiosity',
      camera: 'mast',
      sol: 1000,
    },
  },
};

export const SURFACE_MARKERS = [
  { lat: 18, lon: 120, siteId: null },
  { lat: 18, lon: 60, siteId: null },
  {
    lat: LANDING_SITE_DATA.curiosity.lat,
    lon: LANDING_SITE_DATA.curiosity.lon,
    siteId: 'curiosity',
  },
];
