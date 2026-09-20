import catSrc from '../assets/avatares/cat.png'
import foxSrc from '../assets/avatares/fox.png'
import lionSrc from '../assets/avatares/lion.png'
import owlSrc from '../assets/avatares/owl.png'
import pandaSrc from '../assets/avatares/panda.png'

export const AVATARS = [
  { id: 'fox', label: 'Zorro', src: foxSrc },
  { id: 'lion', label: 'León', src: lionSrc },
  { id: 'panda', label: 'Panda', src: pandaSrc },
  { id: 'owl', label: 'Búho', src: owlSrc },
  { id: 'cat', label: 'Gato', src: catSrc },
]

export function getAvatar(avatarId) {
  return AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0]
}
