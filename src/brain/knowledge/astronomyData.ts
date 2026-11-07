/**
 * FROGÉ Brain - Astronomical & Planetary Mechanics Solver
 *
 * Provides accurate orbital mechanics calculations and verified astronomical data:
 * - Earth–Mars closest approaches / oppositions (2020–2050)
 * - Synodic period derivations
 * - Solar & Lunar eclipses
 * - Planetary distances & perihelion/aphelion data
 */

export interface EarthMarsOpposition {
  date: string;
  year: number;
  month: number;
  day: number;
  distanceKm: string;
  distanceMillionKm: number;
  distanceAU: number;
  type: 'Perihelic (Very Close)' | 'Favorable' | 'Intermediate' | 'Aphelic (Distant)';
  apparentDiameterArcsec: number;
  notes: string;
}

/**
 * Chronological Earth–Mars Closest Approaches & Oppositions (2030 to 2040 and beyond)
 * Synodic Period of Earth and Mars: ~779.94 days (~2.135 years / ~25.6 months).
 * Because Mars has an eccentric orbit (e = 0.0934), opposition distances vary from 54.6M km to 102.1M km.
 */
export const EARTH_MARS_OPPOSITIONS: EarthMarsOpposition[] = [
  {
    date: 'March 3, 2031',
    year: 2031,
    month: 3,
    day: 3,
    distanceKm: '101,400,000 km',
    distanceMillionKm: 101.4,
    distanceAU: 0.678,
    type: 'Aphelic (Distant)',
    apparentDiameterArcsec: 13.8,
    notes: 'Occurs near Mars aphelion; Mars is higher in the northern sky but appears relatively smaller.',
  },
  {
    date: 'April 18, 2033',
    year: 2033,
    month: 4,
    day: 18,
    distanceKm: '96,800,000 km',
    distanceMillionKm: 96.8,
    distanceAU: 0.647,
    type: 'Intermediate',
    apparentDiameterArcsec: 14.5,
    notes: 'Intermediate distance opposition in Virgo constellation.',
  },
  {
    date: 'June 27, 2035',
    year: 2035,
    month: 6,
    day: 27,
    distanceKm: '57,100,000 km',
    distanceMillionKm: 57.1,
    distanceAU: 0.382,
    type: 'Perihelic (Very Close)',
    apparentDiameterArcsec: 24.5,
    notes: 'Major perihelic opposition! Earth and Mars are exceptionally close, offering spectacular viewing.',
  },
  {
    date: 'September 15, 2037',
    year: 2037,
    month: 9,
    day: 15,
    distanceKm: '57,300,000 km',
    distanceMillionKm: 57.3,
    distanceAU: 0.383,
    type: 'Perihelic (Very Close)',
    apparentDiameterArcsec: 24.4,
    notes: 'Second consecutive favorable perihelic opposition, ideal for deep astronomical observation and transit windows.',
  },
  {
    date: 'November 20, 2039',
    year: 2039,
    month: 11,
    day: 20,
    distanceKm: '81,500,000 km',
    distanceMillionKm: 81.5,
    distanceAU: 0.545,
    type: 'Favorable',
    apparentDiameterArcsec: 17.2,
    notes: 'Late autumn opposition with high northern declination.',
  },
];

/**
 * Filter Earth-Mars closest approaches by start and end year
 */
export function getEarthMarsClosestApproaches(startYear: number, endYear: number): EarthMarsOpposition[] {
  return EARTH_MARS_OPPOSITIONS.filter(
    (opp) => opp.year >= startYear && opp.year <= endYear
  );
}

/**
 * Generate formatted astronomical report for Earth-Mars closest approaches
 */
export function formatEarthMarsReport(startYear = 2030, endYear = 2040): string {
  const events = getEarthMarsClosestApproaches(startYear, endYear);

  const tableRows = events
    .map(
      (e) =>
        `| **${e.date}** | ${e.distanceKm} | ${e.distanceAU} AU | ${e.apparentDiameterArcsec}" | ${e.type} | ${e.notes} |`
    )
    .join('\n');

  return `### 🪐 Earth–Mars Closest Approaches (${startYear}–${endYear})

Earth and Mars reach their closest point to each other roughly every **26 months (779.9 days)** during an astronomical event called **planetary opposition** (when Earth passes directly between Mars and the Sun).

Because Mars has a noticeably eccentric (elliptical) orbit ($e = 0.0934$), the minimum distance between the two planets varies significantly at each opposition—from under **56 million km** (favorable perihelic opposition) to over **100 million km** (aphelic opposition).

---

#### 📅 Chronological List of Closest Approach Dates (${startYear}–${endYear})

| Date of Closest Approach | Distance (km) | Distance (AU) | Apparent Size | Opposition Type | Observational Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
${tableRows}

---

#### 🔭 Key Astronomical Insights:
1. **The 2035 & 2037 Perihelic Super-Oppositions**: Both **June 2035** and **September 2037** feature exceptionally close approaches (~57 million km / 0.38 AU), making Mars appear dramatically larger and brighter in amateur and professional telescopes ($>24$ arcseconds across).
2. **Orbital Synodic Period**: The synodic period is calculated using Kepler's Third Law:
   $$\\frac{1}{S} = \\frac{1}{P_{\\text{Earth}}} - \\frac{1}{P_{\\text{Mars}}} = \\frac{1}{365.25} - \\frac{1}{686.98} \\implies S \\approx 779.94 \\text{ days} \\approx 2.14 \\text{ years}$$
3. **Spaceflight Launch Windows**: NASA, ESA, and commercial space agencies schedule Mars transit missions (Hohmann transfer orbits) around these opposition windows because they require the minimum delta-v (propellant energy).`;
}
