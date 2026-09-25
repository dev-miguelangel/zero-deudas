import amortizacionShot from '../../assets/screenshots/amortizacion.jpg'
import deudasShot from '../../assets/screenshots/deudas.jpg'
import pagosShot from '../../assets/screenshots/pagos.jpg'
import resumenShot from '../../assets/screenshots/resumen.jpg'

export const APP_MOCKUP_SCENES = [
  {
    id: 'resumen',
    label: 'Resumen',
    image: resumenShot,
    help: 'De un vistazo: cuánto debes por tipo de crédito y cuánto vas a pagar en cada uno de los próximos 6 meses — sin sumar nada a mano.',
  },
  {
    id: 'deudas',
    label: 'Deudas',
    image: deudasShot,
    help: 'Agregas lo que ya sabes (cuotas y su valor) y ZeroDeudas calcula solo la tasa real, el saldo y cuánto te falta por pagar.',
  },
  {
    id: 'pagos',
    label: 'Pagos',
    image: pagosShot,
    help: 'Marcas cada cuota a medida que la pagas, mes a mes, y queda un historial ordenado — sin depender de tu memoria.',
  },
  {
    id: 'amortizacion',
    label: 'Amortización',
    image: amortizacionShot,
    help: 'Te decimos qué deuda conviene atacar primero y cuánto puedes ahorrar en intereses si haces un abono extra.',
  },
]
