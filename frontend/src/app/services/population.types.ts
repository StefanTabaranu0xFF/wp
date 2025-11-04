export interface CountryPopulation {
  code: string;
  iso2: string;
  name: string;
  lat: number;
  lng: number;
  population: number;
  trend: 'up' | 'down' | 'steady';
  change: number;
  color: string;
}

export interface PopulationSnapshot {
  updatedAt: string;
  countries: CountryPopulation[];
}
