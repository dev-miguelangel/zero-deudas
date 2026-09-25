import { decryptJSON, deriveKey, encryptJSON } from './crypto'

const APP_ID = 'zerodeudas'
const FILE_VERSION = 1
const CHECK_VALUE = 'zerodeudas-export-ok'

/**
 * Arma el contenido del archivo .zero: el perfil (nombre, avatar), el salt
 * para volver a derivar la clave, un "check" para validar la clave al
 * importar, las deudas cifradas con la misma clave del perfil actual, y
 * cuándo se generó (para poder usarlo después como respaldo "más nuevo"
 * al importar actualizaciones entre dispositivos).
 */
export async function buildExportFile({ profile, cryptoKey, debts }) {
  const [check, data] = await Promise.all([
    encryptJSON(cryptoKey, CHECK_VALUE),
    encryptJSON(cryptoKey, debts),
  ])
  return {
    app: APP_ID,
    version: FILE_VERSION,
    generatedAt: new Date().toISOString(),
    profile: { name: profile.name, avatarId: profile.avatarId },
    salt: profile.salt,
    check,
    data,
  }
}

export function isValidExportFile(file) {
  return Boolean(
    file &&
      file.app === APP_ID &&
      typeof file.version === 'number' &&
      typeof file.salt === 'string' &&
      file.check &&
      file.data &&
      file.profile,
  )
}

/**
 * Deriva la clave a partir de la passphrase + salt del archivo, valida que
 * sea la correcta (vía el check), y si lo es, descifra las deudas.
 * Lanza un error si la passphrase es incorrecta o el archivo está dañado.
 */
export async function decryptExportFile(file, passphrase) {
  const key = await deriveKey(passphrase, file.salt)
  const checkValue = await decryptJSON(key, file.check)
  if (checkValue !== CHECK_VALUE) {
    throw new Error('WRONG_PASSPHRASE')
  }
  const debts = await decryptJSON(key, file.data)
  return { key, debts }
}

function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4))
  const binary = atob(base64 + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

/**
 * Mismo contenido que el archivo .zero, codificado para viajar en el
 * fragmento (#) de una URL — el fragmento nunca se envía al servidor, así
 * que el link es tan privado como el archivo.
 */
export function encodeExportFileForUrl(file) {
  return toBase64Url(JSON.stringify(file))
}

export function decodeExportFileFromUrl(encoded) {
  const parsed = JSON.parse(fromBase64Url(encoded))
  if (!isValidExportFile(parsed)) {
    throw new Error('INVALID_EXPORT_FILE')
  }
  return parsed
}
