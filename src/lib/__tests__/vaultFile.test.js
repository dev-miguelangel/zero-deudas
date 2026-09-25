import { describe, expect, it } from 'vitest'
import { deriveKey, generateSalt } from '../crypto'
import {
  buildExportFile,
  decodeExportFileFromUrl,
  decryptExportFile,
  encodeExportFileForUrl,
  isValidExportFile,
} from '../vaultFile'

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
    expect(new Date(file.generatedAt).toISOString()).toBe(file.generatedAt)

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

describe('encodeExportFileForUrl / decodeExportFileFromUrl', () => {
  it('round-trip: codifica y decodifica el mismo archivo, con tildes y todo', async () => {
    const { profile, cryptoKey } = await makeProfile('mi-clave-segura')
    const file = await buildExportFile({
      profile: { ...profile, name: 'Migüel Ñandú' },
      cryptoKey,
      debts,
    })

    const encoded = encodeExportFileForUrl(file)
    expect(encoded).not.toMatch(/[+/=]/) // seguro para ir en una URL

    const decoded = decodeExportFileFromUrl(encoded)
    expect(decoded).toEqual(file)

    const { debts: decrypted } = await decryptExportFile(decoded, 'mi-clave-segura')
    expect(decrypted).toEqual(debts)
  })

  it('lanza un error si el texto decodificado no es un archivo válido', () => {
    const encoded = encodeExportFileForUrl({ app: 'otra-app' })
    expect(() => decodeExportFileFromUrl(encoded)).toThrow()
  })

  it('lanza un error si el texto ni siquiera es base64/JSON válido', () => {
    expect(() => decodeExportFileFromUrl('esto-no-es-base64-válido')).toThrow()
  })
})
