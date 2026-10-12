export type Phase = 'idle' | 'spinningCountry' | 'countrySelected' | 'spinningCity' | 'citySelected';

export type Action = 'spinCountry' | 'countryDone' | 'spinCity' | 'cityDone' | 'reset';

const transitions: Record<Phase, Partial<Record<Action, Phase>>> = {
  idle: { spinCountry: 'spinningCountry' },
  spinningCountry: { countryDone: 'countrySelected' },
  // A new country spin is allowed once a country (or even a city) has been chosen.
  countrySelected: { spinCountry: 'spinningCountry', spinCity: 'spinningCity', reset: 'idle' },
  spinningCity: { cityDone: 'citySelected' },
  citySelected: { spinCountry: 'spinningCountry', spinCity: 'spinningCity', reset: 'idle' },
};

/** Returns the next phase, or the same phase if the action is not allowed right now. */
export function next(phase: Phase, action: Action): Phase {
  return transitions[phase][action] ?? phase;
}

export const isSpinning = (p: Phase) => p === 'spinningCountry' || p === 'spinningCity';
