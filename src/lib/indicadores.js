const ENDPOINT = 'https://mindicador.cl/api'

export async function fetchIndicadores() {
  const response = await fetch(ENDPOINT)
  if (!response.ok) {
    throw new Error(`mindicador.cl respondió ${response.status}`)
  }
  return response.json()
}
