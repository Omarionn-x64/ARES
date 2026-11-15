import { create } from 'zustand';
import type { SiteId } from './sites';

export type IntroPhase =
  | 'video'
  | 'transition'
  | 'orbit'
  | 'moonFact'
  | 'siteSelect'
  | 'siteFly'
  | 'sitePage'
  | 'entering';

export type MoonId = 'phobos' | 'deimos';
export type MapSiteId = 'gale' | 'perseverance' | 'insight';

interface IntroState {
  phase: IntroPhase;
  selectedMoon: MoonId | null;
  selectedSite: SiteId | null;
  hoveredSite: SiteId | null;
  descentTarget: MapSiteId;
  setPhase: (phase: IntroPhase, descentTarget?: MapSiteId) => void;
  selectMoon: (moonId: MoonId | null) => void;
  openSiteChooser: () => void;
  chooseSite: (siteId: SiteId) => void;
  setSitePage: (siteId: SiteId) => void;
  setHoveredSite: (siteId: SiteId | null) => void;
  returnToOrbit: () => void;
}

export const useIntroStore = create<IntroState>((set) => ({
  phase: 'video',
  selectedMoon: null,
  selectedSite: null,
  hoveredSite: null,
  descentTarget: 'gale',
  setPhase: (phase, descentTarget) =>
    set((state) => ({
      phase,
      selectedMoon: phase === 'moonFact' ? state.selectedMoon : null,
      descentTarget: phase === 'entering' ? (descentTarget ?? 'gale') : state.descentTarget,
      selectedSite:
        phase === 'siteSelect' || phase === 'siteFly' || phase === 'sitePage'
          ? state.selectedSite
          : null,
      hoveredSite: phase === 'siteSelect' || phase === 'siteFly' ? state.hoveredSite : null,
    })),
  selectMoon: (moonId) =>
    set({
      phase: moonId ? 'moonFact' : 'orbit',
      selectedMoon: moonId,
      selectedSite: null,
      hoveredSite: null,
    }),
  openSiteChooser: () =>
    set({
      phase: 'siteSelect',
      selectedMoon: null,
      selectedSite: null,
      hoveredSite: null,
    }),
  chooseSite: (siteId) =>
    set({
      phase: 'siteFly',
      selectedMoon: null,
      selectedSite: siteId,
      hoveredSite: siteId,
    }),
  setSitePage: (siteId) =>
    set({
      phase: 'sitePage',
      selectedMoon: null,
      selectedSite: siteId,
      hoveredSite: siteId,
    }),
  setHoveredSite: (siteId) =>
    set((state) => (state.hoveredSite === siteId ? state : { hoveredSite: siteId })),
  returnToOrbit: () =>
    set({
      phase: 'orbit',
      selectedMoon: null,
      selectedSite: null,
      hoveredSite: null,
    }),
}));
