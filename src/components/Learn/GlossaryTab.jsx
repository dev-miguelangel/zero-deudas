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
    term: 'Amortización',
    definition:
      'Cómo se reparte cada pago entre interés (lo que ya "ganó" el acreedor ese mes) y capital (lo que realmente reduce tu deuda).',
  },
]

export default function GlossaryTab() {
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
              Cuántos meses faltan para que la última de tus deudas llegue a $0,
              pagando el mínimo de cada una.
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
          <div>
            <dt className="text-sm font-semibold text-slate-900">
              IPC (Índice de Precios al Consumidor)
            </dt>
            <dd className="mt-1 text-sm text-slate-600">
              Mide cuánto suben los precios cada mes (inflación). Es el dato con el que
              se reajusta la UF, así que afecta directo el saldo de un crédito
              hipotecario.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
