/**
 * Le pide al navegador que marque el origen como almacenamiento
 * persistente, para que no lo borre automáticamente por falta de espacio
 * (evicción LRU). No protege contra que el usuario borre los datos del
 * sitio a propósito — para eso está el export a archivo .zero.
 */
export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return false
  try {
    return await navigator.storage.persist()
  } catch {
    return false
  }
}
