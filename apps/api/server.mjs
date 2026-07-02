// ─── Cafe NUX Shared Order API ───────────────────────────
// Pure Node.js HTTP server — no dependencies needed.
// Customer app POSTs orders here. Admin app GETs/PATCHes orders here.
// This makes orders from the customer frontend instantly visible in the admin POS queue.

import http from 'http'

const PORT = 3099

// ── In-memory store ──────────────────────────────────────
let orders = [
  {
    id: 'ord_sample_1',
    tableId: '3',
    tableLabel: 'Table 3',
    source: 'online',
    status: 'pending',
    paymentStatus: 'unpaid',
    items: [
      { id: 'oi_0', menuItemId: 'm1', name: 'Espresso', quantity: 2, price: 3.5, subtotal: 7.0 },
      { id: 'oi_1', menuItemId: 'm3', name: 'Butter Croissant', quantity: 1, price: 3.0, subtotal: 3.0 }
    ],
    subtotal: 10.0,
    tax: 1.0,
    grandTotal: 11.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// ── Helpers ──────────────────────────────────────────────
const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

const json = (res, data, status = 200) => {
  cors(res)
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

const readBody = (req) => new Promise((resolve, reject) => {
  let body = ''
  req.on('data', chunk => body += chunk)
  req.on('end', () => { try { resolve(JSON.parse(body || '{}')) } catch { reject(new Error('Invalid JSON')) } })
  req.on('error', reject)
})

// ── Router ───────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const path = url.pathname

  // Preflight
  if (req.method === 'OPTIONS') { cors(res); res.writeHead(204); res.end(); return }

  // GET /orders
  if (req.method === 'GET' && path === '/orders') {
    const status = url.searchParams.get('status')
    const result = status ? orders.filter(o => o.status === status) : orders
    // newest first
    return json(res, [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  }

  // GET /orders/:id
  if (req.method === 'GET' && path.startsWith('/orders/')) {
    const id = path.split('/')[2]
    const order = orders.find(o => o.id === id)
    return order ? json(res, order) : json(res, { error: 'Not found' }, 404)
  }

  if (req.method === 'POST' && path === '/orders') {
    const data = await readBody(req)
    console.log('[API POST /orders] Incoming items:', JSON.stringify(data.items, null, 2))
    const items = (data.items ?? []).map((i, idx) => {
      const basePrice = i.price || 0
      const modifiersTotal = (i.modifiers ?? []).reduce((sum, mod) => sum + mod.price, 0)
      const unitPrice = basePrice + modifiersTotal
      return {
        id: `oi_${idx}_${Date.now()}`,
        menuItemId: i.menuItemId,
        name: i.name || 'Item',
        quantity: i.quantity,
        price: basePrice,
        size: i.size,
        sugarLevel: i.sugarLevel,
        iceLevel: i.iceLevel,
        modifiers: i.modifiers ?? [],
        itemDiscount: i.itemDiscount || 0,
        subtotal: (unitPrice - (i.itemDiscount || 0)) * i.quantity,
        note: i.note
      }
    })
    const subtotal = items.reduce((s, i) => s + i.subtotal, 0)
    const tax = Math.round(subtotal * 0.1 * 100) / 100
    const grandTotal = Math.round((subtotal + tax) * 100) / 100
    const order = {
      id: `ord_${Date.now().toString(36)}`,
      tableId: data.tableId ?? null,
      tableLabel: data.tableLabel || (data.tableId ? `Table ${data.tableId}` : 'Takeaway'),
      source: data.source || 'online',
      status: 'pending',
      paymentStatus: 'unpaid',
      payments: [],
      items,
      subtotal,
      tax,
      grandTotal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    orders.push(order)
    console.log(`[NEW ORDER] ${order.tableLabel} — ${order.items.length} items — $${order.grandTotal}`)
    return json(res, order, 201)
  }

  // PATCH /orders/:id/status
  if (req.method === 'PATCH' && path.match(/^\/orders\/[^/]+\/status$/)) {
    const id = path.split('/')[2]
    const idx = orders.findIndex(o => o.id === id)
    if (idx === -1) return json(res, { error: 'Not found' }, 404)
    const { status } = await readBody(req)
    orders[idx].status = status
    orders[idx].updatedAt = new Date().toISOString()
    console.log(`[STATUS] ${id} → ${status}`)
    return json(res, orders[idx])
  }

  // PATCH /orders/:id/payment
  if (req.method === 'PATCH' && path.match(/^\/orders\/[^/]+\/payment$/)) {
    const id = path.split('/')[2]
    const idx = orders.findIndex(o => o.id === id)
    if (idx === -1) return json(res, { error: 'Not found' }, 404)
    const { paymentStatus, payment } = await readBody(req)
    if (payment) {
      if (!orders[idx].payments) orders[idx].payments = []
      orders[idx].payments.push({
        id: `pay_${Date.now().toString(36)}`,
        amount: payment.amount,
        method: payment.method,
        timestamp: new Date().toISOString()
      })
    }
    if (paymentStatus) {
      orders[idx].paymentStatus = paymentStatus
    }
    orders[idx].updatedAt = new Date().toISOString()
    console.log(`[PAYMENT] ${id} → ${paymentStatus || 'recorded'}`)
    return json(res, orders[idx])
  }

  // DELETE /orders/:id
  if (req.method === 'DELETE' && path.startsWith('/orders/')) {
    const id = path.split('/')[2]
    const before = orders.length
    orders = orders.filter(o => o.id !== id)
    return orders.length < before ? json(res, { ok: true }) : json(res, { error: 'Not found' }, 404)
  }

  json(res, { error: 'Not found' }, 404)
})

server.listen(PORT, () => {
  console.log(`\n🚀 Cafe NUX Shared Order API running at http://localhost:${PORT}`)
  console.log(`   GET  /orders              — list all orders`)
  console.log(`   POST /orders              — customer places order`)
  console.log(`   PATCH /orders/:id/status  — admin updates status`)
  console.log(`   PATCH /orders/:id/payment — admin marks paid\n`)
})
