import { decryptJSON, deriveKey, encryptJSON } from './crypto'

const APP_ID = 'zerodeudas'
const FILE_VERSION = 1
const CHECK_VALUE = 'zerodeudas-export-ok'

/**
 * Arma el contenido del archivo .zero: el perfil (nombre, avatar), el salt
 * para volver a derivar la clave, un "check" para validar la clave al
 * importar, y las deudas cifradas con la misma clave del perfil actual.
 */
export async function buildExportFile({ profile, cryptoKey, debts }) {
  const [check, data] = await Promise.all([
    encryptJSON(cryptoKey, CHECK_VALUE),
    encryptJSON(cryptoKey, debts),
  ])
  return {
    app: APP_ID,
    version: FILE_VERSION,
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
