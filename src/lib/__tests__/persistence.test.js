import { afterEach, describe, expect, it, vi } from 'vitest'
import { requestPersistentStorage } from '../persistence'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('requestPersistentStorage', () => {
  it('devuelve true cuando el navegador concede el almacenamiento persistente', async () => {
    vi.stubGlobal('navigator', { storage: { persist: vi.fn().mockResolvedValue(true) } })
    await expect(requestPersistentStorage()).resolves.toBe(true)
  })

  it('devuelve false si el navegador no soporta la API', async () => {
    vi.stubGlobal('navigator', {})
    await expect(requestPersistentStorage()).resolves.toBe(false)
  })

  it('devuelve false si persist() falla', async () => {
    vi.stubGlobal('navigator', {
      storage: { persist: vi.fn().mockRejectedValue(new Error('nope')) },
    })
    await expect(requestPersistentStorage()).resolves.toBe(false)
  })
})
