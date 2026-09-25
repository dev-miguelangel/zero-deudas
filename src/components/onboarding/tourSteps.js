import { LockIcon, PlusIcon, TableIcon, UploadIcon } from '../icons'

export function welcomeSteps(goToDeudas) {
  return [
    {
      icon: LockIcon,
      title: 'Tu información es solo tuya',
      body: 'Todo lo que registres se cifra en este mismo navegador con tu clave. Ni nosotros ni nadie más puede leerlo. Si olvidas la clave, no hay forma de recuperar los datos — guárdala en un lugar seguro.',
    },
    {
      icon: PlusIcon,
      title: 'Empecemos por tus deudas',
      body: 'Ve a la pestaña "Deudas" y agrega cada una con lo que ya sabes: cuántas cuotas te quedan y cuánto pagas al mes. Nosotros calculamos la tasa real, el saldo y cuánto te falta.',
      cta: { label: 'Ir a Deudas', onClick: goToDeudas },
    },
  ]
}

export function planSteps(goToAmortizacion) {
  return [
    {
      icon: TableIcon,
      title: 'Ya tienes tu primera deuda',
      body: 'En "Amortización" puedes ver una tabla mes a mes de cada deuda y un plan de pago que te dice si conviene bola de nieve o avalancha, y cuánto ahorras en intereses si abonas extra.',
      cta: { label: 'Ir a Amortización', onClick: goToAmortizacion },
    },
    {
      icon: UploadIcon,
      title: 'Lleva tus datos donde quieras',
      body: 'Cuando quieras, exporta un archivo .zero cifrado desde el menú de tu perfil (arriba a la derecha) y ábrelo en otro dispositivo para seguir donde lo dejaste, o genera un enlace para compartir una actualización.',
    },
  ]
}
