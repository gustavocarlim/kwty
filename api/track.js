// Função serverless da Vercel: POST /api/track
// As credenciais do MySQL existem apenas aqui, no servidor.
import { isIP } from 'node:net'
import mysql from 'mysql2/promise'

const MAX_BODY_BYTES = 8 * 1024

// column -> tamanho máximo
const CLICK_IDS = { gclid: 512, gbraid: 512, wbraid: 512 }
const TEXT_FIELDS = {
  utm_source: 255,
  utm_medium: 255,
  utm_campaign: 255,
  utm_term: 255,
  utm_content: 255,
  landing_url: 2048,
  referrer: 2048,
}

let pool

function sslOptions() {
  if (process.env.DB_SSL === 'false') return undefined
  return { minVersion: 'TLSv1.2', rejectUnauthorized: process.env.DB_SSL !== 'no-verify' }
}

function getPool() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env
  if (!DB_HOST || !DB_USER || !DB_NAME) return null

  pool ??= mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT) || 3306,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: sslOptions(),
    charset: 'utf8mb4',
    // hospedagens compartilhadas limitam conexões (inclusive por hora): poucas por
    // instância, reaproveitadas, e descartadas antes de um wait_timeout de 20s
    connectionLimit: 2,
    maxIdle: 1,
    idleTimeout: 15_000,
    connectTimeout: 5_000,
  })
  return pool
}

const text = (value, max) =>
  typeof value === 'string' && value ? Array.from(value).slice(0, max).join('') : null

const clickId = (value, max) =>
  typeof value === 'string' && value.length <= max && /^[\w.-]+$/.test(value) ? value : null

// O IP é um dado secundário: qualquer falha resulta em NULL, sem impedir a gravação.
function clientIp(req) {
  try {
    // na Vercel estes cabeçalhos são definidos pela própria plataforma
    const raw =
      req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket?.remoteAddress
    const ip = raw?.trim().replace(/^::ffff:(?=\d+\.)/i, '')
    // descarta valores inválidos ou maiores que a coluna (ex.: IPv6 com zona)
    return ip && ip.length <= 45 && isIP(ip) ? ip : null
  } catch {
    return null
  }
}

async function readBody(req) {
  // A Vercel já entrega req.body; no Vite local lemos o stream.
  if (req.body !== undefined) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  }
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new Error('body too large')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function isSameOrigin(req) {
  const { origin, host } = req.headers
  if (!origin) return true
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

// Conexão reaproveitada que o servidor já tinha fechado (comum após a função "dormir").
const isStaleConnection = (error) =>
  ['PROTOCOL_CONNECTION_LOST', 'ECONNRESET', 'EPIPE', 'ER_CLIENT_INTERACTION_TIMEOUT'].includes(error.code) ||
  /closed state/.test(error.message)

// Repetir é seguro: visit_id é único, então não há linha duplicada.
async function insert(db, sql, values) {
  try {
    await db.execute(sql, values)
  } catch (error) {
    if (!isStaleConnection(error)) throw error
    await db.execute(sql, values)
  }
}

function reply(res, status) {
  res.statusCode = status
  res.setHeader('Cache-Control', 'no-store')
  res.end()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return reply(res, 405)
  }
  if (!isSameOrigin(req)) return reply(res, 403)
  if (!req.headers['content-type']?.startsWith('application/json')) return reply(res, 415)

  let body
  try {
    body = await readBody(req)
  } catch {
    return reply(res, 400)
  }
  if (typeof body?.visit_id !== 'string' || !/^[A-Za-z0-9-]{8,36}$/.test(body.visit_id)) {
    return reply(res, 400)
  }

  const row = { visit_id: body.visit_id }
  for (const [name, max] of Object.entries(CLICK_IDS)) row[name] = clickId(body[name], max)
  for (const [name, max] of Object.entries(TEXT_FIELDS)) row[name] = text(body[name], max)
  row.user_agent = text(req.headers['user-agent'], 512)
  row.country = text(req.headers['x-vercel-ip-country'], 2)
  row.ip_address = clientIp(req)
  // conversion_value fica NULL: é preenchido depois por outra aplicação
  row.currency_code = 'BRL'

  const db = getPool()
  if (!db) {
    console.error('[track] variáveis DB_HOST, DB_USER e DB_NAME não configuradas')
    return reply(res, 503)
  }

  // Nomes de coluna são fixos (acima); valores vão sempre como parâmetros.
  const columns = Object.keys(row)
  try {
    await insert(
      db,
      `INSERT INTO landing_visits (${columns.join(', ')})
       VALUES (${columns.map(() => '?').join(', ')})`,
      Object.values(row),
    )
  } catch (error) {
    // reenvio da mesma visita: já está gravada
    if (error.code === 'ER_DUP_ENTRY') return reply(res, 204)
    console.error('[track] falha ao gravar:', error.code || error.message)
    return reply(res, 500)
  }
  return reply(res, 204)
}
