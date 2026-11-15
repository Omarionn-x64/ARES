<<<<<<< HEAD
export const NASA_TREK_TILES = {
  vikingOptical:
    'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
  molaElevation:
    'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
  localImageServer:
    'https://trek.nasa.gov/mars/trekarcgis/rest/services/{layer}/ImageServer/exportImage',
};

export const MARS_SITES = {
  perseverance: {
    id: 'perseverance',
    kicker: 'MARS 2020 · JEZERO CRATER',
    title: 'Perseverance Traverse',
    center: [18.4447, 77.4508],
    zoom: 12,
    localTileLayer: null,
    waypoints: [
      {
        id: 'octavia-e-butler',
        title: 'Octavia E. Butler Landing',
        coordinates: [18.4447, 77.4508],
        sol: 0,
        phase: 'Landing',
        elevation: '≈ -2,610 m MOLA',
        geology: 'Jezero crater-floor basalt and reworked lake-basin sediment.',
        instruments: ['Mastcam-Z', 'SuperCam', 'PIXL', 'SHERLOC'],
        summary:
          'Perseverance landed in Jezero, where orbital evidence points to an ancient lake and river delta.',
      },
      {
        id: 'wright-brothers-field',
        title: 'Wright Brothers Field / Ingenuity',
        coordinates: [18.4449, 77.4518],
        sol: 58,
        phase: 'First powered flight',
        elevation: '≈ -2,610 m MOLA',
        geology: 'Sandy crater-floor regolith over basaltic bedrock.',
        instruments: ['Mastcam-Z', 'Navcam', 'Ingenuity navigation cameras'],
        summary:
          'Ingenuity completed its first powered, controlled flight here on Sol 58, demonstrating aerial scouting on Mars.',
      },
      {
        id: 'three-forks',
        title: 'Three Forks Sample Depot',
        coordinates: [18.4312, 77.3995],
        sol: 650,
        phase: 'Sample depot',
        elevation: '≈ -2,590 m MOLA',
        geology: 'Delta-margin sediment with fine-grained and igneous sample materials.',
        instruments: ['Sample Caching System', 'Mastcam-Z', 'SHERLOC', 'PIXL'],
        summary:
          'A cache of sealed rock and regolith tubes was deposited as a backup collection for future sample return.',
      },
      {
        id: 'neretva-vallis',
        title: 'Neretva Vallis Delta Front',
        coordinates: [18.445, 77.372],
        sol: 450,
        phase: 'Western delta traverse',
        elevation: '≈ -2,575 m MOLA',
        geology: 'Layered delta-front deposits shaped by ancient flowing water.',
        instruments: ['Mastcam-Z', 'SuperCam', 'PIXL', 'SHERLOC'],
        summary:
          'The rover examined layered sedimentary outcrops along the western approach to the Jezero delta.',
      },
      {
        id: 'bright-angel-cheyava-falls',
        title: 'Bright Angel & Cheyava Falls',
        coordinates: [18.462, 77.352],
        sol: 1_170,
        phase: 'Margin campaign',
        elevation: '≈ -2,550 m MOLA',
        geology: 'Light-toned, fractured sedimentary rock with mineral veins and distinctive reaction textures.',
        instruments: ['Mastcam-Z', 'SuperCam', 'SHERLOC', 'PIXL'],
        summary:
          'Cheyava Falls showed organic compounds and leopard-spot textures that are being studied as possible, unconfirmed biosignature evidence.',
      },
    ],
  },
  gale: {
    id: 'gale',
    kicker: 'MARS SCIENCE LABORATORY · GALE CRATER',
    title: 'Curiosity Traverse',
    center: [-4.5895, 137.4417],
    zoom: 11,
    localTileLayer: 'curiosity_hirise_mosaic',
    waypoints: [
      {
        id: 'bradbury-landing',
        title: 'Bradbury Landing',
        coordinates: [-4.5895, 137.4417],
        sol: 0,
        phase: 'Landing',
        elevation: '≈ -4,501 m MOLA',
        geology: 'Aeolis Palus crater floor with basaltic materials and ancient alluvial deposits.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI'],
        summary:
          'Curiosity landed within Gale Crater to investigate whether the region once supported microbial life.',
      },
      {
        id: 'yellowknife-bay',
        title: 'Yellowknife Bay',
        coordinates: [-4.5908, 137.4485],
        sol: 125,
        phase: 'Lakebed investigation',
        elevation: '≈ -4,505 m MOLA',
        geology: 'Fine-grained mudstone deposited in an ancient freshwater lake.',
        instruments: ['SAM', 'CheMin', 'APXS', 'MAHLI', 'ChemCam'],
        summary:
          'Mudstone drilled at Yellowknife Bay contained clay minerals and chemical ingredients favorable to ancient microbial habitability.',
      },
      {
        id: 'vera-rubin-ridge',
        title: 'Vera Rubin Ridge',
        coordinates: [-4.645, 137.392],
        sol: 1_800,
        phase: 'Ridge campaign',
        elevation: '≈ -4,250 m MOLA',
        geology: 'Layered bedrock with orbital hematite signatures and local sulfate-bearing veins.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI', 'DAN'],
        summary:
          'The ridge preserves a distinct mineralogical record that helped trace changes in Gale Crater’s ancient groundwater.',
      },
      {
        id: 'gediz-vallis',
        title: 'Gediz Vallis Channel',
        coordinates: [-4.682, 137.378],
        sol: 3_878,
        phase: 'Channel exploration',
        elevation: '≈ -4,100 m MOLA',
        geology: 'Eroded channel and debris-flow deposits on the lower slopes of Mount Sharp.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI', 'SAM'],
        summary:
          'Curiosity investigated a channel whose landforms record a later episode of water and debris transport on Mount Sharp.',
      },
    ],
  },
  insight: {
    id: 'insight',
    kicker: 'INSIGHT · ELYSIUM PLANITIA',
    title: 'InSight Landing Site',
    center: [4.5024, 135.6234],
    zoom: 12,
    localTileLayer: null,
    waypoints: [
      {
        id: 'homestead-hollow',
        title: 'Homestead Hollow',
        coordinates: [4.5024, 135.6234],
        sol: 0,
        phase: 'Landing and deployment',
        elevation: '≈ -2,600 m MOLA',
        geology: 'Low-relief volcanic plain mantled by impact fragments and fine dust.',
        instruments: ['SEIS', 'HP³', 'RISE', 'TWINS'],
        summary:
          'InSight used this stable Elysium Planitia site to measure marsquakes, interior structure, heat flow, and rotation.',
      },
    ],
  },
};
=======
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
>>>>>>> d561fef9899caf119ac5efb85dea48346dcdd542
