import { useVault } from '../../context/VaultContext'
import ConfirmPassphraseModal from '../ConfirmPassphraseModal'

export default function DeleteProfileModal({ profileId, profileName, onClose }) {
  const { verifyPassphraseFor, removeProfile } = useVault()

  return (
    <ConfirmPassphraseModal
      message={
        <>
          Esto borra permanentemente el perfil <strong>{profileName}</strong> y todos sus
          datos. No se puede deshacer.
        </>
      }
      confirmLabel="Eliminar perfil"
      verify={(passphrase) => verifyPassphraseFor(profileId, passphrase)}
      onConfirm={() => removeProfile(profileId)}
      onClose={onClose}
    />
  )
}
