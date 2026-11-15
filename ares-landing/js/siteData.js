export const NASA_TREK_TILES = {
  vikingOptical:
    'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
  molaElevation:
    'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
  localImageServer:
    'https://trek.nasa.gov/mars/trekarcgis/rest/services/{layer}/ImageServer/exportImage',
  traverseMapServer:
    'https://trek.nasa.gov/mars/trekarcgis/rest/services/{layer}/MapServer/export',
};

export const MARS_SITES = {
  perseverance: {
    id: 'perseverance',
    kicker: 'MARS 2020 · JEZERO CRATER',
    title: 'Perseverance Traverse',
    center: [18.4447, 77.4508],
    zoom: 12,
    localTileLayer: null,
    traverseLayerName: 'Perseverance_Traverse_Path',
    waypoints: [
      {
        id: 'octavia-e-butler',
        title: 'Octavia E. Butler Landing',
        coordinates: [18.4447, 77.4508],
        sol: 0,
        date: 'Feb. 18, 2021',
        phase: 'Landing',
        elevation: '-2,566 m MOLA',
        geology:
          'Jezero crater-floor rocks are primarily igneous; nearby delta deposits record ancient river and lake activity.',
        instruments: ['Mastcam-Z', 'SuperCam', 'PIXL', 'SHERLOC', 'MEDA'],
        summary:
          'Perseverance landed in Jezero Crater on Feb. 18, 2021. The landing site is named for author Octavia E. Butler. Jezero preserves a former lake basin and river delta selected for investigating past habitability and caching rock and regolith samples.',
      },
      {
        id: 'wright-brothers-field',
        title: 'Wright Brothers Field / Ingenuity',
        coordinates: [18.4449, 77.4521],
        sol: 58,
        date: 'Apr. 19, 2021',
        phase: 'First powered flight on another planet',
        elevation: '-2,566 m MOLA',
        geology:
          'Jezero crater-floor terrain within the ancient lake basin; the flight field was a small, relatively level patch selected for helicopter operations.',
        instruments: ['Ingenuity', 'Mastcam-Z', 'Navcam'],
        summary:
          'Ingenuity made the first powered, controlled flight on another planet on Sol 58. The technology demonstrator eventually completed 72 flights; its flight program ended in January 2024 after rotor damage.',
      },
      {
        id: 'artuby-citadelle',
        title: 'Artuby Ridge & Citadelle (First Rock Cores)',
        coordinates: [18.4285, 77.4512],
        sol: '194–196',
        date: 'Sept. 6–8, 2021',
        phase: 'First successful rock cores',
        elevation: '-2,574 m MOLA',
        geology:
          'Rochette is an igneous crater-floor rock at the Máaz–Séítah boundary. The first two successful cores were named Montdenier and Montagnac.',
        instruments: ['PIXL', 'SHERLOC', 'WATSON', 'Mastcam-Z', 'Sample Caching System'],
        summary:
          'NASA records the first two successful rock cores, Montdenier and Montagnac, at Rochette on Artuby Ridge on Sols 194 and 196 (Sept. 6 and 8, 2021). The nearby Citadelle outcrop was part of the rover’s early crater-floor investigation.',
      },
      {
        id: 'south-seitah',
        title: 'South Séítah (Brac & Issole)',
        coordinates: [18.4345, 77.4415],
        sol: 271,
        date: 'Nov. 24, 2021',
        phase: 'South Séítah sampling campaign',
        elevation: '-2,564 m MOLA',
        geology:
          'Olivine-rich igneous cumulates in Séítah show mineralogical and textural evidence of later interaction with water.',
        instruments: ['PIXL', 'SHERLOC', 'SuperCam', 'Mastcam-Z', 'Sample Caching System'],
        summary:
          'At Brac, Perseverance sealed the Coulettes core on Sol 271. South Séítah sampling also included the earlier Salette core at Brac (Sol 262) and Robine at Issole (Sol 298); the named features therefore span a campaign, not one stop.',
      },
      {
        id: 'enchanted-lake-hawksbill-gap',
        title: 'Enchanted Lake & Hawksbill Gap (Delta Front)',
        coordinates: [18.4465, 77.4055],
        sol: 490,
        date: 'July 7, 2022',
        phase: 'First sedimentary delta-front core',
        elevation: '-2,514 m MOLA',
        geology:
          'The western delta front contains fine-grained lake deposits and coarser river-laid sandstone and conglomerate.',
        instruments: ['PIXL', 'SHERLOC', 'SuperCam', 'Mastcam-Z', 'Sample Caching System'],
        summary:
          'The NASA sample record lists Swift Run, collected at Skinner Ridge on Sol 490, as Perseverance’s first sedimentary core from the delta front. Enchanted Lake and Hawksbill Gap are nearby named features along the rover’s route.',
      },
      {
        id: 'wildcat-ridge',
        title: 'Wildcat Ridge (Skinner Ridge)',
        coordinates: [18.4488, 77.4042],
        sol: 509,
        date: 'July 27, 2022',
        phase: 'Organic-rich sedimentary core',
        elevation: '-2,514 m MOLA',
        geology:
          'Sulfate-bearing delta-front mudstone; organic compounds were detected in samples from this sedimentary unit.',
        instruments: ['SHERLOC', 'PIXL', 'WATSON', 'Mastcam-Z', 'Sample Caching System'],
        summary:
          'Perseverance collected the Hazeltop core from Wildcat Ridge on Sol 509. NASA describes the sulfate-bearing mudstone as having the highest concentration of organic molecules detected by the mission at that time; this is not evidence that life was present.',
      },
      {
        id: 'three-forks',
        title: 'Three Forks Sample Depot',
        coordinates: [18.4312, 77.3995],
        sol: 690,
        date: 'Jan. 28, 2023',
        phase: 'Backup sample depot completed',
        elevation: '-2,530 m MOLA',
        geology:
          'Flat crater-floor ground near the base of Jezero’s fan-shaped delta; ten sealed tubes were arranged for potential future recovery.',
        instruments: ['Sample Caching System', 'WATSON', 'Mastcam-Z', 'Navcam'],
        summary:
          'Perseverance completed the Three Forks depot by depositing its tenth tube on Sol 690. The depot contains a backup set of selected rock and regolith samples, plus an atmospheric sample and a witness tube.',
      },
      {
        id: 'berea-upper-fan',
        title: 'Berea & Upper Fan',
        coordinates: [18.4645, 77.392],
        sol: 749,
        date: 'Mar. 30, 2023',
        phase: 'Upper-fan sampling',
        elevation: '-2,467 m MOLA',
        geology:
          'Berea is a sedimentary sandstone in Jezero’s upper fan. Its carbonate cement and coarse grains are consistent with deposition and alteration by flowing water.',
        instruments: ['PIXL', 'SHERLOC', 'SuperCam', 'Mastcam-Z', 'Sample Caching System'],
        summary:
          'NASA’s sample record lists the Melyn core from Berea as collected on Sol 749 (Mar. 30, 2023). This corrects the often-confused Sol 779 date; the nearby Upper Fan includes rocks deposited by ancient river flows.',
      },
      {
        id: 'margin-unit-gnaraloo-bay',
        title: 'Margin Unit & Gnaraloo Bay',
        coordinates: [18.469, 77.3765],
        sol: 985,
        date: 'Nov. 27, 2023',
        phase: 'Margin-unit investigation',
        elevation: '-2,448 m MOLA',
        geology:
          'The inner crater-rim margin unit includes carbonate- and silica-bearing rocks that record water–rock alteration and possible shoreline processes.',
        instruments: ['PIXL', 'SHERLOC', 'SuperCam', 'Mastcam-Z'],
        summary:
          'Perseverance investigated the margin unit while traversing the inner rim of Jezero’s ancient lake basin. The exposed carbonate- and silica-rich rocks help test how water moved through and altered the crater’s rim materials.',
      },
      {
        id: 'neretva-mount-washburn',
        title: 'Neretva Vallis & Mount Washburn',
        coordinates: [18.445, 77.372],
        sol: 1_152,
        date: 'May 17, 2024',
        phase: 'Inflow-channel panorama',
        elevation: '-2,461 m MOLA',
        geology:
          'Neretva Vallis is an approximately 400-meter-wide channel cut by water flowing into Jezero. Mount Washburn is a separate nearby boulder field; Atoko Point there is a light-toned anorthosite.',
        instruments: ['Mastcam-Z', 'SuperCam', 'PIXL', 'SHERLOC'],
        summary:
          'Mastcam-Z captured a view within Neretva Vallis on Sol 1,152. NASA describes the channel as an ancient water-fed valley about 400 meters wide. Atoko Point at Mount Washburn is a distinct, earlier rover target and is not the subject of this Sol 1,152 panorama.',
      },
      {
        id: 'bright-angel-cheyava-falls',
        title: 'Bright Angel / Cheyava Falls',
        coordinates: [18.462, 77.352],
        sol: 1_215,
        date: 'July 21, 2024',
        phase: 'Sapphire Canyon core collected',
        elevation: '-2,428 m MOLA',
        geology:
          'Bright Angel clay- and silt-rich sedimentary rocks contain organic carbon, sulfur, oxidized iron, and phosphorus. PIXL and SHERLOC identified reaction-front patterns with vivianite and greigite at Cheyava Falls.',
        instruments: ['PIXL', 'SHERLOC', 'WATSON', 'Mastcam-Z', 'Sample Caching System'],
        summary:
          'Perseverance collected the Sapphire Canyon core from Cheyava Falls on Sol 1,215. NASA’s 2025 peer-reviewed findings describe potential biosignatures, not confirmed evidence of life; abiotic explanations cannot be ruled out.',
      },
      {
        id: 'witch-hazel-hill',
        title: 'Crater Rim Ascent / Witch Hazel Hill',
        coordinates: [18.458, 77.334],
        sol: 1_401,
        date: 'Jan. 28, 2025',
        phase: 'Crater-rim campaign',
        elevation: '-2,340 m MOLA',
        geology:
          'The western rim exposes ancient Noachian crust and impact-related igneous rocks that predate Jezero Crater.',
        instruments: ['PIXL', 'SHERLOC', 'SuperCam', 'Mastcam-Z', 'Sample Caching System'],
        summary:
          'The rover’s crater-rim campaign reached the Shallow Bay sampling area at Witch Hazel Hill. NASA’s sample record dates the Silver Mountain core to Sol 1,401 (Jan. 28, 2025), later than the initial rim-ascent estimate.',
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
    traverseLayerName: 'curiosity_path',
    waypoints: [
      {
        id: 'bradbury-landing',
        title: 'Bradbury Landing',
        coordinates: [-4.5894669521, 137.4416334989],
        sol: 0,
        date: 'Aug. 5, 2012 PDT / Aug. 6 UTC',
        phase: 'Landing',
        elevation: '-4,500 m MOLA',
        geology:
          'Aeolis Palus on Gale Crater’s floor, where rounded fluvial pebbles and ancient lake deposits are preserved.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI', 'SAM', 'CheMin'],
        summary:
          'Curiosity landed inside Gale Crater on Aug. 5, 2012 PDT (Aug. 6 UTC). The 154-kilometer crater was selected because orbital observations indicated that it may once have held liquid water.',
      },
      {
        id: 'yellowknife-bay',
        title: 'Yellowknife Bay (John Klein & Cumberland)',
        coordinates: [-4.5908, 137.4485],
        sol: '125 / 182 / 279',
        date: 'Dec. 12, 2012; Feb. 8 & May 19, 2013',
        phase: 'Yellowknife Bay arrival and drill campaign',
        elevation: '-4,505 m MOLA',
        geology:
          'Fine-grained Sheepbed mudstone formed in an ancient, relatively fresh lake and contains clay minerals and key chemical ingredients for life.',
        instruments: ['SAM', 'CheMin', 'APXS', 'MAHLI', 'ChemCam'],
        summary:
          'Curiosity entered Yellowknife Bay on Sol 125, drilled John Klein on Sol 182, and drilled Cumberland on Sol 279. The samples showed that the ancient lakebed had chemistry and environmental conditions that could have supported microbial life; they do not prove life existed.',
      },
      {
        id: 'darwin-cooperstown',
        title: 'Darwin & Cooperstown Waypoints',
        coordinates: [-4.6070737088, 137.426278631],
        sol: 392,
        date: 'Sept. 12, 2013',
        phase: 'Fluvial-conglomerate traverse',
        elevation: '-4,492 m MOLA',
        geology:
          'Rounded, cemented conglomerates contain gravel transported and deposited by ancient flowing water.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI', 'MARDI'],
        summary:
          'The Darwin and Cooperstown region lies along Curiosity’s traverse from the landing area toward Mount Sharp. Rounded pebbles and conglomerates here preserve evidence of ancient stream transport; this curated pin groups nearby campaign waypoints.',
      },
      {
        id: 'kimberley-windjana',
        title: 'The Kimberley (Windjana Drill)',
        coordinates: [-4.6363373651, 137.4021686024],
        sol: 621,
        date: 'May 5, 2014',
        phase: 'Windjana drill campaign',
        elevation: '-4,474 m MOLA',
        geology:
          'Layered sandstone at the Kimberley contains grains and strata that record ancient river transport and sediment deposition.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI', 'SAM', 'CheMin'],
        summary:
          'Curiosity drilled Windjana at the Kimberley on Sol 621. The sandstone’s layered structure and mineral composition helped scientists compare ancient fluvial deposits with the mudstones found earlier at Yellowknife Bay.',
      },
      {
        id: 'pahrump-hills',
        title: 'Pahrump Hills (Base of Mount Sharp)',
        coordinates: [-4.6624119382, 137.3772435372],
        sol: 753,
        date: 'Sept. 18, 2014',
        phase: 'Lower Murray formation campaign',
        elevation: '-4,443 m MOLA',
        geology:
          'The basal Murray formation is dominated by fine-grained lacustrine mudstones deposited in long-lived lakes.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI', 'SAM', 'CheMin'],
        summary:
          'Pahrump Hills exposed the lower layers of Mount Sharp. Curiosity investigated sites including Confidence Hills and Mojave 2 during the campaign, analyzing mudstones that preserve evidence of ancient lake environments.',
      },
      {
        id: 'marias-pass-buckskin',
        title: 'Marias Pass (Buckskin Silica Discovery)',
        coordinates: [-4.6679388355, 137.3714025664],
        sol: 1_060,
        date: 'Aug. 5, 2015',
        phase: 'Buckskin high-silica drill',
        elevation: '-4,446 m MOLA',
        geology:
          'A geological contact near Marias Pass exposed silica-rich mudstone; the Buckskin drill sample contained the mineral tridymite.',
        instruments: ['ChemCam', 'Mastcam', 'APXS', 'MAHLI', 'SAM', 'CheMin'],
        summary:
          'Curiosity collected the Buckskin sample at the Marias Pass area on Sol 1,060, correcting the earlier Sol 992 attribution. The unusual tridymite-bearing sample provided evidence of silica-rich volcanic material in Gale Crater.',
      },
      {
        id: 'bagnold-dunes',
        title: 'Bagnold Dunes (Namib & High Dune)',
        coordinates: [-4.679074713, 137.36569186],
        sol: 1_184,
        date: 'Dec. 5, 2015',
        phase: 'Active dune investigation',
        elevation: '-4,409 m MOLA',
        geology:
          'Active basaltic sand dunes are part of the Bagnold dune field along Mount Sharp’s northwestern flank.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI', 'SAM', 'CheMin'],
        summary:
          'Curiosity investigated the Namib and High Dune areas in the Bagnold field, the first active extraterrestrial sand dunes studied in place. The campaign measured dune composition, grain motion, and wind-driven surface changes.',
      },
      {
        id: 'naukluft-murray-buttes',
        title: 'Naukluft Plateau & Murray Buttes',
        coordinates: [-4.6954, 137.35334],
        sol: 1_421,
        date: 'Aug. 5, 2016',
        phase: 'Eroded buttes and cross-bedded sandstone',
        elevation: '-4,380 m MOLA',
        geology:
          'Wind-sculpted buttes expose cross-bedded Stimson formation sandstone overlying finer-grained Murray formation rocks.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI', 'MARDI'],
        summary:
          'The Naukluft Plateau and Murray Buttes campaign documented wind erosion and layered sandstone on the approach to Mount Sharp. The cross-bedding records ancient dune deposits later lithified into rock.',
      },
      {
        id: 'vera-rubin-ridge',
        title: 'Vera Rubin Ridge (Hematite Ridge)',
        coordinates: [-4.72053, 137.36832],
        sol: 1_809,
        date: 'Sept. 7, 2017',
        phase: 'Hematite-rich ridge campaign',
        elevation: '-4,257 m MOLA',
        geology:
          'Layered Murray formation rocks on the ridge carry a strong hematite signature, recording mineral alteration by water.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI', 'DAN', 'SAM', 'CheMin'],
        summary:
          'Curiosity investigated Vera Rubin Ridge and drilled targets including Duluth and Highfield. The ridge’s hematite-bearing rocks preserve evidence of groundwater alteration; this pin marks the selected campaign waypoint, not every drill location.',
      },
      {
        id: 'glen-torridon',
        title: 'Glen Torridon (Clay-Bearing Unit)',
        coordinates: [-4.6645, 137.3945],
        sol: 2_302,
        date: 'Jan. 27, 2019',
        phase: 'Clay-bearing unit campaign',
        elevation: '-4,425 m MOLA',
        geology:
          'The Glen Torridon trough contains phyllosilicate-bearing rocks, commonly interpreted as recording water–rock interaction.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI', 'SAM', 'CheMin'],
        summary:
          'Curiosity explored the clay-bearing Glen Torridon region and later drilled Aberlady, Kilmarie, and Mary Anning targets during the campaign. The clay minerals help reconstruct how water altered Mount Sharp’s sedimentary layers.',
      },
      {
        id: 'mont-mercou',
        title: 'Mont Mercou & Greenheugh Pediment Transition',
        coordinates: [-4.6725, 137.3885],
        sol: 3_060,
        date: 'Mar. 16, 2021',
        phase: 'Stratigraphic transition',
        elevation: '-4,401 m MOLA',
        geology:
          'A roughly 6-meter stratified outcrop exposes layers across a transition from clay-bearing Murray rocks toward sulfate-bearing strata.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI', 'SAM', 'CheMin'],
        summary:
          'Mont Mercou provided a detailed view of Mount Sharp’s layered rocks as Curiosity investigated the transition toward the Greenheugh Pediment. The stratigraphy records changing sediment and water conditions through time.',
      },
      {
        id: 'marker-band-valley',
        title: 'Marker Band Valley (Amapari Marker Band)',
        coordinates: [-4.6795, 137.3835],
        sol: 3_620,
        date: 'Oct. 12, 2022',
        phase: 'Marker-band investigation',
        elevation: '-4,391 m MOLA',
        geology:
          'The resistant marker band contains layered sedimentary rocks; wave ripples found in the region indicate waves in an ancient shallow lake.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI', 'SAM', 'CheMin'],
        summary:
          'Curiosity crossed the marker-band region while ascending Mount Sharp. Wave-rippled textures documented nearby indicate that open-water waves once affected a shallow lake, adding evidence for persistent surface water.',
      },
      {
        id: 'gediz-vallis-channel',
        title: 'Gediz Vallis Channel & Sulfur Field',
        coordinates: [-4.688, 137.378],
        sol: '4,311–4,312',
        date: 'Sept. 21–22, 2024',
        phase: 'Channel panorama',
        elevation: '-4,376 m MOLA',
        geology:
          'The channel and adjacent ridge preserve evidence of late-stage water and debris flows. Pure elemental sulfur crystals were found in the broader channel campaign.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI', 'SAM', 'CheMin'],
        summary:
          'Curiosity acquired a 341-image panorama within Gediz Vallis on Sols 4,311–4,312. The pure sulfur crystals were a separate discovery during the broader channel exploration; the panorama date should not be read as the sulfur discovery date.',
      },
      {
        id: 'boxwork-structures',
        title: 'Boxwork Structures (Sulfate-Bearing Unit)',
        coordinates: [-4.694, 137.3735],
        sol: 4_420,
        date: 'Jan. 2025',
        phase: 'Boxwork terrain investigation',
        elevation: '-4,341 m MOLA',
        geology:
          'Polygonal ridges and intervening troughs are sulfate-bearing structures shaped by groundwater circulation and later erosion.',
        instruments: ['Mastcam', 'ChemCam', 'APXS', 'MAHLI', 'SAM', 'CheMin'],
        summary:
          'Curiosity entered the boxwork terrain while ascending Mount Sharp. The mineralized ridge networks provide a record of groundwater movement through fractured rock and the subsequent erosion of surrounding material.',
      },
    ],
  },
  insight: {
    id: 'insight',
    kicker: 'INSIGHT · ELYSIUM PLANITIA',
    title: 'InSight Mission Timeline',
    center: [4.5024, 135.6234],
    zoom: 14,
    localTileLayer: null,
    traverseLayerName: null,
    waypoints: [
      {
        id: 'insight-touchdown',
        title: 'Homestead Hollow Touchdown & IDA Workspace',
        coordinates: [4.5024, 135.6234],
        sol: 0,
        date: 'Nov. 26, 2018',
        phase: 'Touchdown',
        elevation: '-2,617 m MOLA',
        geology:
          'A smooth Elysium Planitia plain near the rim of a degraded impact crater about 27 meters wide, nicknamed Homestead Hollow.',
        instruments: ['IDC', 'ICC', 'RISE', 'TWINS'],
        summary:
          'InSight landed in western Elysium Planitia to study Mars’ interior. Its Instrument Deployment Arm (IDA) and cameras documented the workspace; RISE radio science and TWINS weather sensors supported the mission’s geophysical measurements.',
      },
      {
        id: 'insight-seis',
        title: 'SEIS Seismometer & Wind/Thermal Shield Deployment',
        coordinates: [4.50236, 135.62342],
        sol: 66,
        date: 'Feb. 2, 2019',
        phase: 'Seismometer shield placed',
        elevation: '-2,617 m MOLA',
        geology:
          'The seismometer sat directly on the Elysium Planitia surface under a domed wind and thermal shield.',
        instruments: ['SEIS', 'Wind and Thermal Shield', 'TWINS'],
        summary:
          'The SEIS deployment was completed with its shield on Sol 66. Across the mission, SEIS detected more than 1,300 marsquakes, including a magnitude 4.7 event on Sol 1,222, enabling scientists to infer the structure of Mars’ crust, mantle, and liquid iron-alloy core.',
      },
      {
        id: 'insight-hp3',
        title: 'HP³ ("The Mole") & Rolling Stones Rock Investigation',
        coordinates: [4.50237, 135.62338],
        sol: 76,
        date: 'Feb. 12, 2019',
        phase: 'Heat-flow probe campaign',
        elevation: '-2,617 m MOLA',
        geology:
          'Cohesive duricrust and unexpectedly strong soil cohesion impeded the self-hammering HP³ mole.',
        instruments: ['HP³', 'IDC', 'ICC', 'RISE'],
        summary:
          'The HP³ probe was placed on the surface for its heat-flow investigation, but the mole could not reach its planned depth in the unexpectedly cohesive regolith. The nearby “Rolling Stones” rock was among the lander’s workspace targets; the coordinate is a mission-phase marker, not a rover traverse point.',
      },
      {
        id: 'insight-end-of-mission',
        title: 'Final Dust-Covered Solar Array & End of Mission',
        coordinates: [4.5024, 135.6234],
        sol: 1_440,
        date: 'Dec. 15, 2022',
        phase: 'End of mission',
        elevation: '-2,617 m MOLA',
        geology:
          'The lander remained on the same Elysium Planitia surface; dust accumulation on its solar arrays reduced available power.',
        instruments: ['SEIS', 'RISE', 'TWINS'],
        summary:
          'InSight completed its mission after 1,440 sols on Mars. NASA declared the mission ended on Dec. 15, 2022, after the lander stopped communicating as dust accumulation reduced power.',
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
      'Perseverance landed in Jezero Crater on Feb. 18, 2021. NASA selected the ancient lake-and-delta basin to investigate past habitability and cache rock and regolith samples. This map highlights selected mission milestones, not every drive endpoint.',
  },
  {
    id: 'insight',
    lat: MARS_SITES.insight.center[0],
    lon: MARS_SITES.insight.center[1],
    kicker: 'INSIGHT · ELYSIUM PLANITIA',
    title: 'InSight Landing Site',
    details:
      'InSight landed in western Elysium Planitia on Nov. 26, 2018, to study Mars’ interior. Its planned landing zone was an ellipse; this marker identifies the touchdown location.',
  },
  {
    id: 'gale',
    lat: MARS_SITES.gale.center[0],
    lon: MARS_SITES.gale.center[1],
    kicker: 'CURIOSITY · GALE CRATER',
    title: 'Gale Crater / Curiosity Landing Site',
    details:
      'Curiosity landed in Gale Crater on Aug. 5, 2012 PDT (Aug. 6 UTC). NASA selected the 154-kilometer-wide crater because orbital data suggested it may once have held liquid water.',
  },
];
