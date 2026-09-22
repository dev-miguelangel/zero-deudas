import { describe, expect, it } from 'vitest'
import { deriveKey, generateSalt } from '../crypto'
import { buildExportFile, decryptExportFile, isValidExportFile } from '../vaultFile'

const debts = [
  { id: 'a', acreedor: 'Banco X', tipo: 'consumo', saldo: 1000, tasaInteresAnual: 20, pagoMinimo: 100 },
]

async function makeProfile(passphrase) {
  const salt = generateSalt()
  const cryptoKey = await deriveKey(passphrase, salt)
  const profile = { name: 'Miguel', avatarId: 'fox', salt }
  return { profile, cryptoKey }
}

describe('buildExportFile / decryptExportFile', () => {
  it('round-trip: exporta y luego descifra con la misma passphrase', async () => {
    const { profile, cryptoKey } = await makeProfile('mi-clave-segura')
    const file = await buildExportFile({ profile, cryptoKey, debts })

    expect(isValidExportFile(file)).toBe(true)
    expect(file.profile).toEqual({ name: 'Miguel', avatarId: 'fox' })

    const { debts: decrypted } = await decryptExportFile(file, 'mi-clave-segura')
    expect(decrypted).toEqual(debts)
  })

  it('rechaza una passphrase incorrecta', async () => {
    const { profile, cryptoKey } = await makeProfile('clave-correcta')
    const file = await buildExportFile({ profile, cryptoKey, debts })

    await expect(decryptExportFile(file, 'clave-incorrecta')).rejects.toThrow()
  })
})

describe('isValidExportFile', () => {
  it('rechaza archivos que no son de esta app', () => {
    expect(isValidExportFile(null)).toBe(false)
    expect(isValidExportFile({})).toBe(false)
    expect(isValidExportFile({ app: 'otra-app' })).toBe(false)
  })
})
