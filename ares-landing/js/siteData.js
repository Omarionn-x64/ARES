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
        elevation: '≈ -2.6 km MOLA',
        geology:
          'Jezero crater-floor igneous rocks, with ancient river-delta and lake deposits nearby.',
        instruments: ['Mastcam-Z', 'SuperCam', 'PIXL', 'SHERLOC'],
        summary:
          'Perseverance landed here on Feb. 18, 2021. Jezero preserves evidence of an ancient lake and river delta; the rover is studying the crater’s geology and caching samples.',
      },
      {
        id: 'wright-brothers-field',
        title: 'Wright Brothers Field / Ingenuity',
        coordinates: [18.4449, 77.4518],
        sol: 58,
        phase: 'First powered flight',
        elevation: '≈ -2.6 km MOLA',
        geology:
          'Jezero crater-floor terrain near the ancient delta and lake deposits.',
        instruments: ['Mastcam-Z', 'Navcam', 'Ingenuity'],
        summary:
          'Ingenuity made the first powered, controlled flight on another planet here on Sol 58 (Apr. 19, 2021). The helicopter completed 72 flights before its mission ended.',
      },
      {
        id: 'three-forks',
        title: 'Three Forks Sample Depot',
        coordinates: [18.4312, 77.3995],
        sol: 690,
        phase: 'Sample depot completed',
        elevation: '≈ -2.6 km MOLA',
        geology:
          'Flat ground near the base of Jezero’s fan-shaped delta; the depot contains samples of igneous and sedimentary rocks, plus atmospheric and witness tubes.',
        instruments: ['Sample Caching System', 'WATSON', 'Mastcam-Z'],
        summary:
          'Perseverance completed the 10-tube Three Forks backup depot on Sol 690 (Jan. 28, 2023) for possible retrieval by a future sample-return mission.',
      },
      {
        id: 'neretva-vallis',
        title: 'Neretva Vallis',
        coordinates: [18.445, 77.372],
        sol: 1_152,
        phase: 'Mastcam-Z panorama',
        elevation: '≈ -2.6 km MOLA',
        geology:
          'A dune-filled river channel about 400 m wide that carried fresh water into Jezero Crater billions of years ago.',
        instruments: ['Mastcam-Z'],
        summary:
          'On Sol 1,152 (May 17, 2024), Mastcam-Z captured a downstream view of the channel. NASA’s traverse map dates the rover’s Neretva Vallis crossing to Jan. 21–June 11, 2024.',
      },
      {
        id: 'bright-angel-cheyava-falls',
        title: 'Bright Angel / Cheyava Falls',
        coordinates: [18.462, 77.352],
        sol: 1_215,
        phase: 'Sapphire Canyon sample sealed',
        elevation: '≈ -2.6 km MOLA',
        geology:
          'Bright Angel sedimentary clay and silt are rich in organic carbon, sulfur, oxidized iron, and phosphorus. PIXL and SHERLOC documented reaction fronts with vivianite and greigite at Cheyava Falls.',
        instruments: ['PIXL', 'SHERLOC', 'Mastcam-Z'],
        summary:
          'Perseverance sealed the Sapphire Canyon core from Cheyava Falls on Sol 1,215 (July 21, 2024). NASA’s 2025 peer-reviewed findings describe potential biosignatures, not confirmed evidence of life; nonbiological explanations cannot be ruled out.',
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
        elevation: '≈ -4.5 km MOLA',
        geology:
          'Aeolis Palus on Gale Crater’s floor, where ancient stream and lake deposits are preserved.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI'],
        summary:
          'Curiosity landed in Gale Crater on Aug. 5, 2012 PDT (Aug. 6 UTC). The 154-km crater was selected for evidence that it once held liquid water.',
      },
      {
        id: 'yellowknife-bay',
        title: 'Yellowknife Bay',
        coordinates: [-4.5908, 137.4485],
        sol: 125,
        phase: 'Lakebed investigation',
        elevation: '≈ -4.5 km MOLA',
        geology:
          'Fine-grained mudstone deposited in an ancient freshwater lake, with clay minerals and relatively low salinity.',
        instruments: ['SAM', 'CheMin', 'APXS', 'MAHLI', 'ChemCam'],
        summary:
          'Curiosity entered Yellowknife Bay on Sol 125 (Dec. 12, 2012). Later drilling at John Klein and Cumberland found clay-rich mudstone and key chemical ingredients in an ancient freshwater-lake environment.',
      },
      {
        id: 'vera-rubin-ridge',
        title: 'Vera Rubin Ridge',
        coordinates: [-4.645, 137.392],
        sol: '~1,800–1,943',
        phase: 'Hematite-ridge traverse',
        elevation: '≈ -4.3 km MOLA',
        geology:
          'Layered lower-Mount-Sharp bedrock along a ridge with a strong hematite signature.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI', 'DAN'],
        summary:
          'Curiosity was driving up Vera Rubin Ridge by Sol 1,788 and exploring its south rim by Sol 1,943. The Sol range is a regional campaign reference, not a precise visit date for this map pin.',
      },
      {
        id: 'gediz-vallis',
        title: 'Gediz Vallis Channel',
        coordinates: [-4.682, 137.378],
        sol: '4,311–4,312',
        phase: 'Channel panorama',
        elevation: '≈ -4.1 km MOLA',
        geology:
          'A channel on Mount Sharp that records a late period of water and debris transport; the adjacent ridge preserves evidence of one of the area’s last wet periods.',
        instruments: ['Mastcam'],
        summary:
          'Curiosity captured a 341-image panorama within Gediz Vallis on Sept. 21–22, 2024 (Sols 4,311–4,312). It later exited the channel and drove along its western edge.',
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
        phase: 'Landing',
        elevation: '≈ -2.6 km MOLA',
        geology:
          'The smooth, low-relief Elysium Planitia plain; InSight landed near the rim of a degraded impact crater nicknamed Homestead Hollow.',
        instruments: ['SEIS', 'HP³ (did not reach planned depth)', 'RISE', 'TWINS weather sensors'],
        summary:
          'InSight landed on Nov. 26, 2018, to study Mars’ interior. SEIS and RISE returned science data, but the HP³ heat-flow mole could not reach its planned depth; the mission ended on Dec. 15, 2022.',
      },
    ],
  },
};

export const SURFACE_MARKERS = [
  {
    id: 'perseverance',
    lat: MARS_SITES.perseverance.center[0],
    lon: MARS_SITES.perseverance.center[1],
    kicker: 'MARS 2020 · JEZERO CRATER',
    title: 'Perseverance Landing Site',
    details:
      'Perseverance landed in Jezero Crater on Feb. 18, 2021. NASA selected the ancient lake-and-delta basin to investigate past habitability and cache rock and regolith samples. Mastcam-Z captures zoomable color and 3D images; this map follows selected mission locations.',
  },
  {
    id: 'insight',
    lat: MARS_SITES.insight.center[0],
    lon: MARS_SITES.insight.center[1],
    kicker: 'INSIGHT · ELYSIUM PLANITIA',
    title: 'InSight Landing Site',
    details:
      'InSight landed in western Elysium Planitia on Nov. 26, 2018, to study Mars’ interior. Its planned landing zone was an ellipse; this marker identifies the actual landing site.',
  },
  {
    id: 'gale',
    lat: MARS_SITES.gale.center[0],
    lon: MARS_SITES.gale.center[1],
    kicker: 'CURIOSITY · GALE CRATER',
    title: 'Gale Crater / Curiosity Landing Site',
    details:
      'Curiosity landed in Gale Crater on Aug. 5, 2012 PDT (Aug. 6 UTC). NASA selected the 154-km-wide crater because orbital data suggested it may once have held liquid water. The rover has found evidence of ancient rivers and lakes and explored Mount Sharp’s layered rocks.',
  },
];
