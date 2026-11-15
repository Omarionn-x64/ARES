export async function fetchMarsTrekCapabilities() {
  const res = await fetch('/api/mars-trek/capabilities');

  if (!res.ok) {
    throw new Error('Unable to fetch Mars Trek capabilities.');
  }

  return res.text();
}

export async function fetchCuriosityTile({
  tileMatrix,
  tileRow,
  tileCol,
  extension = 'png',
}) {
  const params = new URLSearchParams({
    tileMatrix: String(tileMatrix),
    tileRow: String(tileRow),
    tileCol: String(tileCol),
  });

  if (extension) {
    params.set('extension', extension);
  }

  const res = await fetch(`/api/mars-trek/tile?${params.toString()}`);

  if (!res.ok) {
    throw new Error('Unable to fetch Mars Trek tile.');
  }

  return res.blob();
}
