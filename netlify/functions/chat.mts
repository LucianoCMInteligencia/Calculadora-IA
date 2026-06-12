import type { Config } from '@netlify/functions'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

const SYSTEM_PROMPT = `Eres FinanzIA, un asistente financiero experto integrado en una calculadora inteligente.

Estás especializado en:
- Impuestos: IVA, IGIC, IRPF, Impuesto de Sociedades, retenciones
- Interés simple y compuesto, anualidades y amortizaciones de deuda
- Análisis de inversiones: ROI, TIR (IRR), VAN (NPV), periodo de recuperación (payback)
- Préstamos e hipotecas: cuota mensual (método francés), tablas de amortización
- Ratios financieros: ROE, ROA, margen neto, liquidez corriente, endeudamiento, EBITDA
- Mercados financieros: bolsa, renta fija, fondos de inversión, ETFs, dividendos
- Divisas y tipos de cambio
- Planificación financiera personal: presupuesto, ahorro, jubilación, fondo de emergencia
- Fiscalidad y optimización fiscal básica

Cuando el usuario solicite cálculos, muestra el proceso paso a paso y señala claramente el resultado final.
Usa el símbolo de moneda apropiado según el contexto (€ por defecto, $ si el usuario lo especifica).
Responde siempre en español. Sé conciso, claro y profesional pero accesible.
Si el usuario hace una pregunta fuera del ámbito financiero, responde brevemente y redirige al tema financiero.`

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const { message, history = [] } = body

    if (!message || typeof message !== 'string') {
      return new Response('Message is required', { status: 400 })
    }

    const messages: Anthropic.MessageParam[] = [
      ...history.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const stream = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
      stream: true,
    })

    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(new TextEncoder().encode(event.delta.text))
            }
          }
          controller.close()
        },
      }),
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      }
    )
  } catch (error) {
    console.error('FinanzIA chat error:', error)
    return new Response('Error al procesar la solicitud', { status: 500 })
  }
}

export const config: Config = {
  path: '/api/chat',
}
