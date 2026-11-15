export async function fetchCuriositySiteData() {
  const res = await fetch('/api/nasa/curiosity', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Unable to fetch Curiosity landing site data');
  }

  return res.json();
}
