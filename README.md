# Global Population Pulse

This project combines an Angular single-page application with a Node.js backend to simulate live demographic changes across major countries. The backend produces synthetic population trends similar to a "web meter" feed, while the frontend renders an animated isometric globe and a simplified world map that are color coded based on the trend for each country.

## Project structure

```
backend/   # Express server that produces simulated population data
frontend/  # Angular application that visualizes the data on a globe and map
```

## Prerequisites

- Node.js 18+
- npm 9+

## Getting started

Install the dependencies for both workspaces:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Run the backend

```bash
cd backend
npm run start
```

The backend listens on port **4000** and exposes two endpoints:

- `GET /api/health` – service health check
- `GET /api/population` – returns the latest simulated population snapshot

### Run the Angular frontend

In a new terminal:

```bash
cd frontend
npm run start
```

The Angular dev server proxies `/api/*` requests to the backend when both are running locally. Open <http://localhost:4200> in your browser to see the live visualization.

## Visual behaviour

- **Isometric globe** – rendered with Three.js and three-globe. Points for each country grow in altitude as population increases. The globe slowly rotates and highlights growth (green), decline (red), and stability (amber).
- **Map view** – a simplified D3-based map that mirrors the trend color for each country. Tooltips show population and directional change.
- **Data table** – lists all simulated countries with numeric values and status badges that match the globe and map.

The backend continuously perturbs each country's population to mimic real-time fluctuations, providing a consistent data feed for the UI components.
