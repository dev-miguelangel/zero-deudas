import { CloseIcon, DownloadIcon } from '../icons'

/**
 * Transcripción de `src/assets/normativa.md` — se muestra como JSX (no se
 * parsea el markdown en runtime) para no sumar una dependencia solo para
 * esto. Si el archivo fuente cambia, hay que actualizar este componente a
 * mano.
 */
export default function NormativaModal({ onClose }) {
  function handlePrint() {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 py-8 print:static print:block print:overflow-visible print:bg-white print:p-0">
      <style>{`
        @media print {
          @page { size: letter; margin: 2cm; }
        }
      `}</style>

      <div className="max-h-full w-[90vw] max-w-3xl overflow-y-auto rounded-lg bg-white p-6 print:m-0 print:max-h-none print:w-full print:max-w-none print:overflow-visible print:rounded-none print:p-0">
        <div className="flex items-start justify-between gap-3 print:hidden">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Normativa de abonos a capital
            </h2>
            <p className="text-sm text-slate-500">Art. 10, Ley N° 18.010 y normativa CMF</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              <DownloadIcon className="h-4 w-4" />
              Exportar a PDF
            </button>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-400 print:hidden">
          &quot;Exportar a PDF&quot; abre el diálogo de impresión de tu navegador — elige
          &quot;Guardar como PDF&quot; como destino.
        </p>

        <div
          className="mx-auto mt-4 aspect-[8.5/11] w-full max-w-[680px] overflow-y-auto rounded-md border border-slate-200 bg-white p-10 text-sm leading-relaxed text-slate-700 shadow-sm print:mt-0 print:aspect-auto print:max-w-none print:overflow-visible print:border-0 print:p-0 print:shadow-none"
        >
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Esta es un <strong>resumen generado con IA</strong> de la normativa, hecho solo
            como referencia — puede contener errores u omisiones. El texto oficial se
            encuentra en{' '}
            <a
              href="https://bcn.cl/2e2v0"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              bcn.cl
            </a>
            .
          </div>

          <h1 className="mt-4 text-lg font-bold text-slate-900">
            Condiciones de la Banca Chilena para Realizar Abonos a Capital (Prepagos)
          </h1>
          <p className="mt-3">
            Las condiciones para realizar abonos extraordinarios a capital (prepagos) en
            Chile están reguladas por la <strong>Ley N° 18.010</strong> y las normativas de
            la Comisión para el Mercado Financiero (CMF).
          </p>

          <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-900">
            1. Condiciones legales generales
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong>Monto mínimo (regla del 10%):</strong> por ley (Art. 10, Ley 18.010),
              tienes derecho a realizar un prepago parcial siempre que el monto abonado sea
              al menos equivalente al 10% del saldo de capital adeudado.
              <br />
              <span className="text-slate-500">
                Nota: si el monto es menor al 10%, la aceptación depende de las políticas
                internas de cada institución financiera.
              </span>
            </li>
            <li>
              <strong>Comisión de prepago (compensación de intereses):</strong> la normativa
              permite a los bancos cobrar una comisión por prepago según el tipo de moneda
              del crédito:
              <ul className="mt-1 list-[circle] space-y-1 pl-5">
                <li>
                  Créditos en pesos (no reajustables): 1 mes de intereses calculados sobre el
                  capital pagado anticipadamente.
                </li>
                <li>
                  Créditos en UF (reajustables): 1,5 meses de intereses calculados sobre el
                  capital abonado (caso habitual en créditos hipotecarios).
                </li>
                <li>
                  Operaciones mayores a 5.000 UF: las comisiones pueden pactarse libremente
                  entre las partes en el contrato original.
                </li>
              </ul>
            </li>
            <li>
              <strong>Pago de intereses devengados:</strong> al momento de hacer el prepago,
              debes cancelar el capital abonado más los intereses generados desde el día de
              vencimiento de la última cuota pagada hasta la fecha exacta de la liquidación.
            </li>
          </ul>

          <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-900">
            2. Modalidades de aplicación del abono
          </h2>
          <p className="mt-2">
            Al momento de realizar el pago, el banco te solicitará elegir entre dos opciones
            para reestructurar la deuda:
          </p>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              <strong>Reducción de plazo</strong> (mantener el valor de la cuota): el abono
              elimina cuotas al final del crédito. Ventaja: genera un mayor ahorro total en
              intereses a largo plazo.
            </li>
            <li>
              <strong>Reducción de la cuota/dividendo</strong> (mantener el plazo final): el
              banco recalcula el saldo adeudado entre los meses restantes, disminuyendo el
              costo mensual. Ventaja: libera flujo de caja y capacidad de pago en el día a
              día.
            </li>
          </ol>

          <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-900">
            3. Consideraciones por tipo de producto
          </h2>
          <table className="mt-2 w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="py-1.5 pr-3 font-semibold">Tipo de crédito</th>
                <th className="py-1.5 font-semibold">Restricciones o particularidades</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 align-top">
                <td className="py-1.5 pr-3 font-medium">Crédito hipotecario</td>
                <td className="py-1.5">
                  Requiere solicitar formalmente una Liquidación de Prepago Parcial. Si la
                  operación fue con letras de crédito (Art. 101 LGB), no se permiten
                  prepagos en los meses fijados para sorteos de letras.
                </td>
              </tr>
              <tr className="align-top">
                <td className="py-1.5 pr-3 font-medium">Crédito de consumo</td>
                <td className="py-1.5">
                  Aplican los mismos topes legales de comisión por prepago. En la mayoría de
                  los bancos se puede gestionar directamente desde la banca en línea o app.
                </td>
              </tr>
            </tbody>
          </table>

          <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-900">
            4. Procedimiento para realizar el pago
          </h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              <strong>Solicitar liquidación:</strong> pide a tu ejecutivo o vía portal web un
              Certificado / Liquidación de Prepago Parcial especificando el monto que vas a
              abonar.
            </li>
            <li>
              <strong>Seleccionar opción:</strong> selecciona si deseas reducir el plazo de
              la deuda o disminuir la cuota mensual.
            </li>
            <li>
              <strong>Verificar nueva tabla:</strong> tras procesar el pago, exige el nuevo
              Cuadro de Pago / Tabla de Desarrollo para verificar la actualización del saldo
              adeudado.
            </li>
          </ol>

          <p className="mt-6 border-t border-slate-200 pt-3 text-xs text-slate-500">
            Fuente:{' '}
            <a
              href="https://bcn.cl/2e2v0"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 underline"
            >
              bcn.cl
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
