// Lightweight reactive state machine for the ARES landing sequence
// Phases: 'video' | 'transition' | 'orbit' | 'moonFact' | 'entering'

class IntroStore {
  constructor() {
    this.state = {
      phase: 'video',
      selectedMoon: null,
      descentTarget: 'gale',
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

  setPhase(phase, descentTarget = 'gale') {
    if (
      this.state.phase === phase &&
      (phase !== 'entering' || this.state.descentTarget === descentTarget)
    ) {
      return;
    }

    const updates = { phase };
    if (phase === 'entering') {
      updates.descentTarget = descentTarget;
    }
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
