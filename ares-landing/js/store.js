// Lightweight reactive state machine for the ARES landing sequence
// Phases: 'video' | 'transition' | 'orbit' | 'moonFact' | 'entering'

class IntroStore {
  constructor() {
    this.state = {
      phase: 'video',
      selectedMoon: null,
    };
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setState(partial) {
    const prev = this.state;
    this.state = { ...prev, ...partial };
    this.listeners.forEach((fn) => fn(this.state, prev));
  }

  setPhase(phase) {
    if (this.state.phase === phase) return;
    const updates = { phase };
    if (phase !== 'moonFact') {
      updates.selectedMoon = null;
    }
    this.setState(updates);
  }

  selectMoon(moonId) {
    if (moonId) {
      this.setState({ selectedMoon: moonId, phase: 'moonFact' });
    } else {
      this.setState({ selectedMoon: null, phase: 'orbit' });
    }
  }
}

export const introStore = new IntroStore();
