import { describe, it, expect } from 'vitest';
import { getWeatherLabel } from './weatherIcons';

describe('getWeatherLabel', () => {
  it('returns the label for a known WMO code', () => {
    expect(getWeatherLabel(0)).toBe('Clear sky');
    expect(getWeatherLabel(61)).toBe('Slight rain');
  });

  it('returns "Unknown" for an unmapped code', () => {
    expect(getWeatherLabel(9999)).toBe('Unknown');
  });
});
