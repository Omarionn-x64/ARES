export const SITE_IDS = ['gale', 'jezero', 'insight'] as const;

export type SiteId = (typeof SITE_IDS)[number];

export interface LandingSite {
  id: SiteId;
  displayName: string;
  mission: string;
  region: string;
  latitude: number;
  longitude: number;
  landingDate: string;
  blurb: string;
  accentLabel: string;
  accent: string;
  route: `/site/${SiteId}`;
}

export const LANDING_SITES: Record<SiteId, LandingSite> = {
  gale: {
    id: 'gale',
    displayName: 'Curiosity landing site',
    mission: 'Mars Science Laboratory · Curiosity',
    region: 'Gale Crater · Bradbury Landing',
    latitude: -4.59,
    longitude: 137.44,
    landingDate: 'Aug 6, 2012 (UTC)',
    blurb: 'Curiosity landed in Gale Crater to investigate its layered rocks and evidence of ancient lakes.',
    accentLabel: 'GALE CRATER',
    accent: '#ff925f',
    route: '/site/gale',
  },
  jezero: {
    id: 'jezero',
    displayName: 'Perseverance landing site',
    mission: 'Mars 2020 · Perseverance',
    region: 'Jezero Crater · Octavia E. Butler Landing',
    latitude: 18.44,
    longitude: 77.45,
    landingDate: 'Feb 18, 2021',
    blurb: 'Perseverance landed in Jezero Crater, which preserves an ancient lake basin and river delta.',
    accentLabel: 'ANCIENT DELTA',
    accent: '#7fd8ff',
    route: '/site/jezero',
  },
  insight: {
    id: 'insight',
    displayName: 'InSight landing site',
    mission: 'NASA InSight lander',
    region: 'Elysium Planitia',
    latitude: 4.5,
    longitude: 135.62,
    landingDate: 'Nov 26, 2018',
    blurb: 'InSight studied Mars’ interior from Elysium Planitia; the mission ended in December 2022.',
    accentLabel: 'ELYSIUM PLANITIA',
    accent: '#ffc86b',
    route: '/site/insight',
  },
};

export const LANDING_SITE_LIST = SITE_IDS.map((id) => LANDING_SITES[id]);

export function getSiteForPath(path: string): LandingSite | null {
  const match = /^\/site\/(gale|jezero|insight)\/?$/.exec(path);
  return match ? LANDING_SITES[match[1] as SiteId] : null;
}

export function formatSiteCoordinates(site: Pick<LandingSite, 'latitude' | 'longitude'>): string {
  const latitudeHemisphere = site.latitude < 0 ? 'S' : 'N';
  return `${Math.abs(site.latitude).toFixed(2)}° ${latitudeHemisphere} · ${site.longitude.toFixed(2)}° E`;
}
