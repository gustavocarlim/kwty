// Registra a visita (principalmente o gclid do Google Ads) em /api/track.
// Uma gravação por sessão da aba; um novo identificador de clique gera outra.

const ENDPOINT = '/api/track'
const STORAGE_KEY = 'pulse.visit'
const CLICK_IDS = ['gclid', 'gbraid', 'wbraid']
const UTMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

// O storage pode estar bloqueado; nesse caso a visita é enviada mesmo assim.
function readState() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function saveState(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // sem storage
  }
}

function newId() {
  if (crypto.randomUUID) return crypto.randomUUID()
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function trackVisit() {
  try {
    const params = new URLSearchParams(window.location.search)
    const signature = CLICK_IDS.map((name) => params.get(name) ?? '').join('|')
    const hasClickId = signature !== '||'

    let state = readState()
    // recarregou a página sem um clique novo
    if (state && (!hasClickId || state.signature === signature)) {
      if (state.sent) return
    } else {
      // guarda os dados da chegada para reenviar caso a primeira tentativa falhe
      const payload = {
        visit_id: newId(),
        landing_url: window.location.href,
        referrer: document.referrer,
      }
      for (const name of [...CLICK_IDS, ...UTMS]) payload[name] = params.get(name)
      state = { signature, payload, sent: false }
      saveState(state)
    }

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.payload),
      // conclui mesmo se o visitante sair da página
      keepalive: true,
    })
    if (response.ok) saveState({ ...state, sent: true })
  } catch {
    // o rastreamento nunca pode quebrar a página
  }
}
