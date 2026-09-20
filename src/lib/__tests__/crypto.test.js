import { describe, expect, it } from 'vitest'
import { decryptJSON, deriveKey, encryptJSON, generateSalt } from '../crypto'

describe('crypto', () => {
  it('cifra y descifra un objeto (round-trip)', async () => {
    const salt = generateSalt()
    const key = await deriveKey('mi-passphrase-segura', salt)
    const original = { debts: [{ acreedor: 'Banco X', saldo: 1234.5 }] }

    const payload = await encryptJSON(key, original)
    expect(payload.iv).toBeTypeOf('string')
    expect(payload.ciphertext).toBeTypeOf('string')
    expect(payload.ciphertext).not.toContain('Banco X')

    const decrypted = await decryptJSON(key, payload)
    expect(decrypted).toEqual(original)
  })

  it('rechaza el descifrado con una clave derivada de otra passphrase', async () => {
    const salt = generateSalt()
    const key = await deriveKey('passphrase-correcta', salt)
    const otherKey = await deriveKey('passphrase-incorrecta', salt)

    const payload = await encryptJSON(key, { secreto: true })

    await expect(decryptJSON(otherKey, payload)).rejects.toThrow()
  })

  it('genera salts distintos en cada llamada', () => {
    expect(generateSalt()).not.toEqual(generateSalt())
  })
})
