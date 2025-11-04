const express = require('express');
const cors = require('cors');
const { getSnapshot } = require('./data/countries');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/population', (req, res) => {
  const data = getSnapshot();
  res.json({ updatedAt: new Date().toISOString(), countries: data });
});

app.listen(PORT, () => {
  console.log(`Population backend listening on port ${PORT}`);
});
