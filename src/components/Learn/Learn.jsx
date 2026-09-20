import { AvalancheIcon, SnowballIcon } from '../icons'

const conceptos = [
  {
    term: 'Deuda',
    definition: 'Lo que le debes a un acreedor (banco, tarjeta, casa comercial, etc.).',
  },
  {
    term: 'Tasa de interés anual',
    definition:
      'El porcentaje que el acreedor cobra por prestarte dinero durante un año. La tasa mensual es esa tasa dividida en 12, y se cobra sobre el saldo que aún debes.',
  },
  {
    term: 'Pago mínimo',
    definition:
      'Lo mínimo que exige el acreedor cada mes. Si solo pagas eso, buena parte se va en interés y el saldo baja muy lento.',
  },
  {
    term: 'Abono adicional',
    definition:
      'Plata extra que decides poner cada mes, por encima del pago mínimo, para bajar el saldo más rápido.',
  },
  {
    term: 'Amortización',
    definition:
      'Cómo se reparte cada pago entre interés (lo que ya "ganó" el acreedor ese mes) y capital (lo que realmente reduce tu deuda).',
  },
]

export default function Learn() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Conceptos básicos</h2>
        <dl className="mt-4 space-y-4">
          {conceptos.map(({ term, definition }) => (
            <div key={term}>
              <dt className="text-sm font-semibold text-slate-900">{term}</dt>
              <dd className="mt-1 text-sm text-slate-600">{definition}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Bola de Nieve vs. Avalancha
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Ambas estrategias parten igual: pagas el mínimo de todas tus deudas cada mes.
          La diferencia está en a cuál deuda le pones el abono adicional primero.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <SnowballIcon className="h-6 w-6 text-slate-900" />
              <h3 className="font-semibold text-slate-900">Bola de Nieve</h3>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Ordena tus deudas de <strong>menor a mayor saldo</strong>. El abono
              adicional va primero a la deuda más chica. Cuando esa se termina, todo lo
              que pagabas en ella (mínimo + abono) pasa a la siguiente.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              <strong>A favor:</strong> ves deudas eliminadas rápido, lo que ayuda a
              mantener la motivación.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              <strong>En contra:</strong> normalmente terminas pagando algo más de
              interés total que con Avalancha.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <AvalancheIcon className="h-6 w-6 text-slate-900" />
              <h3 className="font-semibold text-slate-900">Avalancha</h3>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Ordena tus deudas de <strong>mayor a menor tasa de interés</strong>. El
              abono adicional va primero a la deuda más cara, sin importar su tamaño.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              <strong>A favor:</strong> matemáticamente pagas menos interés total y
              sales de deudas antes.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              <strong>En contra:</strong> si esa deuda es grande, puede tardar en verse
              el primer resultado.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            <strong>¿Cuál elegir?</strong> Si te cuesta mantener la disciplina y
            necesitas ver "victorias" rápido, prueba Bola de Nieve. Si te importa más
            pagar el menor interés posible y no te afecta esperar, prueba Avalancha. En
            la pestaña <strong>Simulación</strong> puedes comparar cuánto interés total
            pagarías con cada una antes de decidir.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Cómo leer tu resumen</h2>
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="text-sm font-semibold text-slate-900">Deuda total</dt>
            <dd className="mt-1 text-sm text-slate-600">
              La suma de los saldos pendientes de todas tus deudas hoy.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-900">Tiempo restante</dt>
            <dd className="mt-1 text-sm text-slate-600">
              Cuántos meses faltan para llegar a $0, con la estrategia y el abono
              adicional que elegiste.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-900">Ahorro en intereses</dt>
            <dd className="mt-1 text-sm text-slate-600">
              Cuánto interés te ahorras por poner un abono adicional, comparado con
              pagar solo el mínimo de todas tus deudas.
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Indicadores del día</h2>
        <p className="mt-2 text-sm text-slate-600">
          Se muestran en el Resumen porque afectan créditos comunes en Chile:
        </p>
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="text-sm font-semibold text-slate-900">UF (Unidad de Fomento)</dt>
            <dd className="mt-1 text-sm text-slate-600">
              Una unidad que sube junto con la inflación. Muchos créditos hipotecarios
              están en UF, así que el monto en pesos de esa deuda cambia día a día.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-900">Dólar</dt>
            <dd className="mt-1 text-sm text-slate-600">
              Valor del dólar estadounidense en pesos chilenos. Relevante si tienes
              deudas o gastos en dólares.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-900">UTM (Unidad Tributaria Mensual)</dt>
            <dd className="mt-1 text-sm text-slate-600">
              Unidad usada por el Estado para multas, impuestos y algunos contratos.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-900">TPM (Tasa de Política Monetaria)</dt>
            <dd className="mt-1 text-sm text-slate-600">
              La tasa de referencia del Banco Central. Cuando sube o baja, tiende a
              mover las tasas de interés que ofrecen los bancos en créditos nuevos.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
