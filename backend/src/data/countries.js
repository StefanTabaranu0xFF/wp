const BASE_COUNTRIES = [
  {
    code: 'USA',
    iso2: 'US',
    name: 'United States',
    lat: 37.0902,
    lng: -95.7129,
    population: 334805000
  },
  {
    code: 'CHN',
    iso2: 'CN',
    name: 'China',
    lat: 35.8617,
    lng: 104.1954,
    population: 1411750000
  },
  {
    code: 'IND',
    iso2: 'IN',
    name: 'India',
    lat: 20.5937,
    lng: 78.9629,
    population: 1380004385
  },
  {
    code: 'IDN',
    iso2: 'ID',
    name: 'Indonesia',
    lat: -0.7893,
    lng: 113.9213,
    population: 276361783
  },
  {
    code: 'PAK',
    iso2: 'PK',
    name: 'Pakistan',
    lat: 30.3753,
    lng: 69.3451,
    population: 225199937
  },
  {
    code: 'BRA',
    iso2: 'BR',
    name: 'Brazil',
    lat: -14.235,
    lng: -51.9253,
    population: 213993437
  },
  {
    code: 'NGA',
    iso2: 'NG',
    name: 'Nigeria',
    lat: 9.082,
    lng: 8.6753,
    population: 206139587
  },
  {
    code: 'BGD',
    iso2: 'BD',
    name: 'Bangladesh',
    lat: 23.685,
    lng: 90.3563,
    population: 170971781
  },
  {
    code: 'RUS',
    iso2: 'RU',
    name: 'Russia',
    lat: 61.524,
    lng: 105.3188,
    population: 146074130
  },
  {
    code: 'MEX',
    iso2: 'MX',
    name: 'Mexico',
    lat: 23.6345,
    lng: -102.5528,
    population: 130262216
  }
];

const TREND_COLORS = {
  up: '#2e7d32',
  down: '#c62828',
  steady: '#ffb300'
};

const STATE = BASE_COUNTRIES.map(country => ({
  ...country,
  previousPopulation: country.population,
  trend: 'steady',
  change: 0
}));

function updateCountry(country) {
  const drift = country.population * 0.0005;
  const delta = (Math.random() - 0.5) * drift * 2;
  const nextPopulation = Math.max(country.population + delta, 0);
  const change = nextPopulation - country.population;
  let trend = 'steady';

  if (Math.abs(change) / (country.population || 1) > 0.0002) {
    trend = change > 0 ? 'up' : 'down';
  }

  const changePercent = country.population
    ? (change / country.population) * 100
    : 0;

  return {
    ...country,
    previousPopulation: country.population,
    population: Math.round(nextPopulation),
    trend,
    change: changePercent
  };
}

function getSnapshot() {
  for (let i = 0; i < STATE.length; i += 1) {
    STATE[i] = updateCountry(STATE[i]);
  }

  return STATE.map(country => ({
    code: country.code,
    iso2: country.iso2,
    name: country.name,
    lat: country.lat,
    lng: country.lng,
    population: country.population,
    trend: country.trend,
    change: Number(country.change.toFixed(3)),
    color: TREND_COLORS[country.trend]
  }));
}

module.exports = {
  getSnapshot
};
