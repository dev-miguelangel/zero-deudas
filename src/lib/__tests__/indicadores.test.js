import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchIndicadores } from '../indicadores'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchIndicadores', () => {
  it('devuelve el JSON cuando la respuesta es exitosa', async () => {
    const payload = { fecha: '2026-01-01', uf: { valor: 37000 } }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(payload) }),
    )

    await expect(fetchIndicadores()).resolves.toEqual(payload)
  })

  it('lanza un error cuando la respuesta no es ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    await expect(fetchIndicadores()).rejects.toThrow()
  })
})
