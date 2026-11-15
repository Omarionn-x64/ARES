import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

KEY = os.getenv('NASA_API_KEY')
TEMPLATE = 'https://<ENDPOINT>/1.0.0/<STYLE>/<MATRIXSET>/{z}/{row}/{col}.jpg'
LAT, LON = -5.4, 137.8
ZOOMS = range(3, 8)
RADIUS = 2


def center_tile(lat, lon, z):
    cols, rows = 2 ** (z + 1), 2 ** z
    return int((lon + 180) / 360 * cols), int((90 - lat) / 180 * rows)


for z in ZOOMS:
    c0, r0 = center_tile(LAT, LON, z)
    for row in range(r0 - RADIUS, r0 + RADIUS + 1):
        for col in range(c0 - RADIUS, c0 + RADIUS + 1):
            url = TEMPLATE.format(z=z, row=row, col=col)
            if KEY:
                url += f'?api_key={KEY}'
            r = requests.get(url, timeout=30)
            if r.status_code == 200:
                path = f'public/tiles/{z}/{row}/{col}.jpg'
                os.makedirs(os.path.dirname(path), exist_ok=True)
                with open(path, 'wb') as f:
                    f.write(r.content)
            else:
                print('skip', z, row, col, r.status_code)
            time.sleep(0.2)
