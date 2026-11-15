const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5500);
const nasaApiKey = process.env.NASA_API_KEY?.trim();
const marsTrekCapabilitiesUrl = process.env.MARS_TREK_CAPABILITIES_URL || 'https://trek.nasa.gov/tiles/Mars/EQ/curiosity_hirise_mosaic/1.0.0/WMTSCapabilities.xml';
const marsTrekTileBaseUrl = process.env.MARS_TREK_TILE_BASE_URL || 'https://trek.nasa.gov/tiles/Mars/EQ/curiosity_hirise_mosaic/1.0.0';
const marsTrekStyle = process.env.MARS_TREK_STYLE || 'default028mm';
const marsTrekMatrixSet = process.env.MARS_TREK_MATRIX_SET || 'default028mm';
const marsTrekTileExtension = process.env.MARS_TREK_TILE_EXTENSION || 'png';

function buildFallbackCuriosityPhotos() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#20160f"/>
          <stop offset="50%" stop-color="#6d3d1a"/>
          <stop offset="100%" stop-color="#120d0a"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)"/>
      <circle cx="905" cy="170" r="90" fill="#f4c98a" opacity="0.2"/>
      <path d="M0 520 C190 450, 280 560, 440 510 C620 450, 770 510, 995 470 C1110 445, 1170 470, 1200 480 L1200 800 L0 800 Z" fill="#8b4622" opacity="0.9"/>
      <path d="M0 610 C220 562, 360 620, 540 590 C720 560, 920 610, 1200 560 L1200 800 L0 800 Z" fill="#3b1d13" opacity="0.9"/>
      <text x="80" y="160" font-family="Arial, sans-serif" font-size="58" fill="#f3d7ab">Curiosity landing site</text>
      <text x="80" y="220" font-family="Arial, sans-serif" font-size="30" fill="#f3d7ab" opacity="0.85">Gale Crater • fallback imagery</text>
      <text x="80" y="690" font-family="Arial, sans-serif" font-size="26" fill="#f3d7ab" opacity="0.8">Local fallback data: NASA live feed unavailable.</text>
    </svg>
  `;

  return [{
    id: 'fallback-curiosity',
    rover: 'Curiosity',
    camera: 'MAST',
    sol: 1000,
    earth_date: '2026-11-15',
    img_src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
  }];
}

app.get('/api/nasa/curiosity', async (req, res) => {
  if (!nasaApiKey) {
    return res.json({
      photos: buildFallbackCuriosityPhotos(),
      fallback: true,
      warning: 'NASA_API_KEY is not configured; using local fallback Curiosity content.',
    });
  }

  const rover = 'curiosity';
  const camera = 'mast';
  const sol = 1000;
  const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&camera=${camera}&api_key=${encodeURIComponent(nasaApiKey)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const payload = await response.text();
      console.warn('NASA API request failed; using fallback Curiosity content.', payload);
      return res.json({
        photos: buildFallbackCuriosityPhotos(),
        fallback: true,
        warning: 'NASA API request failed; using local fallback Curiosity content.',
      });
    }

    const data = await response.json();
    const photos = Array.isArray(data.photos) && data.photos.length > 0 ? data.photos.slice(0, 4) : buildFallbackCuriosityPhotos();

    return res.json({
      photos: photos.map((photo) => ({
        id: photo.id,
        rover: photo.rover?.name || 'Curiosity',
        camera: photo.camera?.name || camera,
        sol: photo.sol,
        img_src: photo.img_src || buildFallbackCuriosityPhotos()[0].img_src,
        earth_date: photo.earth_date,
      })),
      fallback: Array.isArray(data.photos) && data.photos.length === 0,
    });
  } catch (error) {
    console.error('Curiosity NASA proxy error:', error);
    return res.json({
      photos: buildFallbackCuriosityPhotos(),
      fallback: true,
      warning: 'Proxy could not reach the NASA Mars API; using local fallback Curiosity content.',
    });
  }
});

app.get('/api/mars-trek/capabilities', async (req, res) => {
  try {
    const response = await fetch(marsTrekCapabilitiesUrl, {
      headers: {
        Accept: 'application/xml, text/xml, application/octet-stream',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: 'Mars Trek capabilities request failed.',
        details: text,
      });
    }

    const xml = await response.text();
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (error) {
    console.error('Mars Trek capabilities fetch failed:', error);
    return res.status(502).json({
      error: 'Unable to reach the Mars Trek capabilities endpoint.',
    });
  }
});

app.get('/api/mars-trek/tile', async (req, res) => {
  const { tileMatrix, tileRow, tileCol } = req.query;

  if (!tileMatrix || !tileRow || !tileCol) {
    return res.status(400).json({
      error: 'tileMatrix, tileRow, and tileCol are required.',
    });
  }

  const tileUrl = new URL(
    `${marsTrekStyle}/${marsTrekMatrixSet}/${tileMatrix}/${tileRow}/${tileCol}.${marsTrekTileExtension}`,
    marsTrekTileBaseUrl.endsWith('/') ? marsTrekTileBaseUrl : `${marsTrekTileBaseUrl}/`
  ).toString();

  try {
    const response = await fetch(tileUrl, {
      headers: {
        Accept: 'image/*',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Mars Trek tile request failed.',
      });
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();
    res.set('Content-Type', contentType);
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('Mars Trek tile fetch failed:', error);
    return res.status(502).json({
      error: 'Unable to fetch Mars Trek tile.',
    });
  }
});

app.use(express.static(path.join(__dirname)));

app.listen(port, () => {
  console.log(`ARES landing app running at http://localhost:${port}`);
});
