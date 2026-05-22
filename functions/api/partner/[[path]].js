/**
 * Partner Console API — Cloudflare Pages + D1 (PARTNER_DB).
 * Routes: /api/partner/*
 */

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' }
const EMPTY_CHECKLIST = {
  spaceReady: false,
  decorationReady: false,
  foodConfirmed: false,
  childrenCountConfirmed: false,
  allergiesChecked: false,
  animatorConfirmed: false,
  paymentChecked: false,
}

function json(data, status = 200) {
  return Response.json(data, { status, headers: JSON_HEADERS })
}

function error(message, status = 400) {
  return json({ error: message }, status)
}

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function nowIso() {
  return new Date().toISOString()
}

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function mapPlayroom(row) {
  if (!row) return null
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug,
    address: row.address,
    city: row.city,
    phone: row.phone,
    email: row.email,
    openingHours: parseJson(row.opening_hours_json, {}),
    slotDurationMinutes: row.slot_duration_minutes,
    cleanupBufferMinutes: row.cleanup_buffer_minutes,
    maxParallelEvents: row.max_parallel_events,
    defaultDepositAmount: row.default_deposit_amount,
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapPackage(row) {
  return {
    id: row.id,
    playroomId: row.playroom_id,
    name: row.name,
    description: row.description,
    durationMinutes: row.duration_minutes,
    basePrice: row.base_price,
    includedChildren: row.included_children,
    extraChildPrice: row.extra_child_price,
    includesAnimator: Boolean(row.includes_animator),
    isActive: Boolean(row.is_active),
    sortOrder: row.sort_order,
  }
}

function mapAddon(row) {
  return {
    id: row.id,
    playroomId: row.playroom_id,
    name: row.name,
    description: row.description,
    price: row.price,
    isActive: Boolean(row.is_active),
    category: row.category,
  }
}

function mapAnimator(row) {
  return {
    id: row.id,
    playroomId: row.playroom_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    skills: parseJson(row.skills_json, []),
    availableDays: parseJson(row.available_days_json, []),
    maxEventsPerDay: row.max_events_per_day,
    hourlyRate: row.hourly_rate,
    isActive: Boolean(row.is_active),
  }
}

function mapCustomer(row, children) {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    notes: row.notes ?? '',
    children: children.map((child) => ({
      id: child.id,
      name: child.name,
      birthDate: child.birth_date ?? '',
      allergies: child.allergies ?? '',
      notes: child.notes ?? '',
    })),
  }
}

function mapReservation(row, addonIds, animatorIds) {
  return {
    id: row.id,
    playroomId: row.playroom_id,
    customerId: row.customer_id,
    packageId: row.package_id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    childName: row.child_name,
    childAge: row.child_age,
    childrenCount: row.children_count,
    theme: row.theme ?? '',
    notes: row.notes ?? '',
    internalNotes: row.internal_notes ?? '',
    totalPrice: row.total_price,
    depositAmount: row.deposit_amount,
    depositPaid: Boolean(row.deposit_paid),
    assignedAnimatorIds: animatorIds,
    addonIds,
    checklist: parseJson(row.checklist_json, EMPTY_CHECKLIST),
    animatorArrivalStatus: row.animator_arrival_status ?? 'pending',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function getPlayroomRow(db) {
  return db.prepare('SELECT * FROM playrooms ORDER BY created_at LIMIT 1').first()
}

async function loadReservationExtras(db, reservationId) {
  const addons = await db
    .prepare('SELECT addon_id FROM reservation_addons WHERE reservation_id = ?')
    .bind(reservationId)
    .all()
  const animators = await db
    .prepare('SELECT animator_id FROM reservation_animators WHERE reservation_id = ?')
    .bind(reservationId)
    .all()
  return {
    addonIds: (addons.results ?? []).map((r) => r.addon_id),
    animatorIds: (animators.results ?? []).map((r) => r.animator_id),
  }
}

async function loadReservation(db, id) {
  const row = await db.prepare('SELECT * FROM birthday_reservations WHERE id = ?').bind(id).first()
  if (!row) return null
  const { addonIds, animatorIds } = await loadReservationExtras(db, id)
  return mapReservation(row, addonIds, animatorIds)
}

async function listReservations(db, playroomId, url) {
  let query = 'SELECT * FROM birthday_reservations WHERE playroom_id = ?'
  const binds = [playroomId]
  const status = url.searchParams.get('status')
  const dateFrom = url.searchParams.get('dateFrom')
  const dateTo = url.searchParams.get('dateTo')

  if (status && status !== 'all') {
    query += ' AND status = ?'
    binds.push(status)
  }
  if (dateFrom) {
    query += ' AND date >= ?'
    binds.push(dateFrom)
  }
  if (dateTo) {
    query += ' AND date <= ?'
    binds.push(dateTo)
  }
  query += ' ORDER BY date, start_time'

  const { results } = await db.prepare(query).bind(...binds).all()
  const items = []
  for (const row of results ?? []) {
    const { addonIds, animatorIds } = await loadReservationExtras(db, row.id)
    items.push(mapReservation(row, addonIds, animatorIds))
  }
  return items
}

async function loadCustomers(db, playroomId) {
  const { results: customerRows } = await db
    .prepare('SELECT * FROM customers WHERE playroom_id = ? ORDER BY full_name')
    .bind(playroomId)
    .all()
  const customers = []
  for (const row of customerRows ?? []) {
    const { results: childRows } = await db
      .prepare('SELECT * FROM children WHERE customer_id = ? ORDER BY name')
      .bind(row.id)
      .all()
    customers.push(mapCustomer(row, childRows ?? []))
  }
  return customers
}

function parseTimeToMinutes(value) {
  const [h, m] = String(value).split(':').map(Number)
  return h * 60 + (m || 0)
}

function minutesToTime(total) {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function weekdayFromDateKey(dateKey) {
  const d = new Date(`${dateKey}T12:00:00`)
  return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()]
}

function generateAvailableSlots(playroom, date, reservations) {
  const weekday = weekdayFromDateKey(date)
  const hours = playroom.openingHours?.[weekday]
  if (!hours || hours.closed) return []

  const duration = playroom.slotDurationMinutes
  const open = parseTimeToMinutes(hours.open)
  const close = parseTimeToMinutes(hours.close)
  const dayReservations = reservations.filter((r) => r.date === date && r.status !== 'cancelled')
  const slots = []

  for (let start = open; start + duration <= close; start += playroom.slotDurationMinutes) {
    const end = start + duration
    let parallel = 0
    for (const reservation of dayReservations) {
      const rStart = parseTimeToMinutes(reservation.startTime)
      const rEnd = parseTimeToMinutes(reservation.endTime) + playroom.cleanupBufferMinutes
      if (rStart < end && start < rEnd) parallel += 1
    }
    if (parallel < playroom.maxParallelEvents) {
      slots.push({ date, startTime: minutesToTime(start), endTime: minutesToTime(end) })
    }
  }
  return slots
}

async function readJsonBody(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

export async function onRequest(context) {
  const { request, env, params } = context
  const db = env.PARTNER_DB

  if (!db) {
    return error('PARTNER_DB binding not configured. Add [[d1_databases]] to wrangler.toml and redeploy.', 501)
  }

  const url = new URL(request.url)
  const segments = String(params.path ?? '')
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean)
  const resource = segments[0] ?? ''
  const resourceId = segments[1] ?? ''
  const method = request.method

  if (resource === '' && method === 'GET') {
    return json({
      service: 'vidimose-partner-api',
      routes: [
        'GET /api/partner/playroom',
        'PATCH /api/partner/playroom',
        'GET /api/partner/packages',
        'GET /api/partner/addons',
        'GET /api/partner/animators',
        'GET /api/partner/customers',
        'GET /api/partner/reservations',
        'GET /api/partner/availability?date=YYYY-MM-DD',
        'GET /api/partner/bootstrap',
      ],
    })
  }

  const playroomRow = await getPlayroomRow(db)
  if (!playroomRow) {
    return error('No playroom found. Run functions/partner/seed.sql on D1.', 404)
  }
  const playroomId = playroomRow.id
  const playroom = mapPlayroom(playroomRow)

  try {
    if (resource === 'bootstrap' && method === 'GET') {
      const packages = (await db.prepare('SELECT * FROM birthday_packages WHERE playroom_id = ? ORDER BY sort_order').bind(playroomId).all()).results ?? []
      const addons = (await db.prepare('SELECT * FROM booking_addons WHERE playroom_id = ? ORDER BY name').bind(playroomId).all()).results ?? []
      const animators = (await db.prepare('SELECT * FROM animators WHERE playroom_id = ? ORDER BY name').bind(playroomId).all()).results ?? []
      const customers = await loadCustomers(db, playroomId)
      const reservations = await listReservations(db, playroomId, url)
      return json({
        playroom,
        packages: packages.map(mapPackage),
        addons: addons.map(mapAddon),
        animators: animators.map(mapAnimator),
        customers,
        reservations,
      })
    }

    if (resource === 'playroom') {
      if (method === 'GET') return json({ playroom })
      if (method === 'PATCH') {
        const body = await readJsonBody(request)
        if (!body) return error('Invalid JSON body')
        await db
          .prepare(
            `UPDATE playrooms SET
              name = COALESCE(?, name),
              address = COALESCE(?, address),
              city = COALESCE(?, city),
              phone = COALESCE(?, phone),
              email = COALESCE(?, email),
              opening_hours_json = COALESCE(?, opening_hours_json),
              slot_duration_minutes = COALESCE(?, slot_duration_minutes),
              cleanup_buffer_minutes = COALESCE(?, cleanup_buffer_minutes),
              max_parallel_events = COALESCE(?, max_parallel_events),
              default_deposit_amount = COALESCE(?, default_deposit_amount),
              updated_at = ?
            WHERE id = ?`,
          )
          .bind(
            body.name ?? null,
            body.address ?? null,
            body.city ?? null,
            body.phone ?? null,
            body.email ?? null,
            body.openingHours ? JSON.stringify(body.openingHours) : null,
            body.slotDurationMinutes ?? null,
            body.cleanupBufferMinutes ?? null,
            body.maxParallelEvents ?? null,
            body.defaultDepositAmount ?? null,
            nowIso(),
            playroomId,
          )
          .run()
        const updated = mapPlayroom(await getPlayroomRow(db))
        return json({ playroom: updated })
      }
    }

    if (resource === 'packages') {
      if (method === 'GET' && !resourceId) {
        const { results } = await db
          .prepare('SELECT * FROM birthday_packages WHERE playroom_id = ? ORDER BY sort_order')
          .bind(playroomId)
          .all()
        return json({ packages: (results ?? []).map(mapPackage) })
      }
      if (method === 'GET' && resourceId) {
        const row = await db.prepare('SELECT * FROM birthday_packages WHERE id = ? AND playroom_id = ?').bind(resourceId, playroomId).first()
        if (!row) return error('Package not found', 404)
        return json({ package: mapPackage(row) })
      }
    }

    if (resource === 'addons') {
      if (method === 'GET' && !resourceId) {
        const { results } = await db
          .prepare('SELECT * FROM booking_addons WHERE playroom_id = ? ORDER BY name')
          .bind(playroomId)
          .all()
        return json({ addons: (results ?? []).map(mapAddon) })
      }
      if (method === 'GET' && resourceId) {
        const row = await db.prepare('SELECT * FROM booking_addons WHERE id = ? AND playroom_id = ?').bind(resourceId, playroomId).first()
        if (!row) return error('Addon not found', 404)
        return json({ addon: mapAddon(row) })
      }
    }

    if (resource === 'animators') {
      if (method === 'GET' && !resourceId) {
        const { results } = await db
          .prepare('SELECT * FROM animators WHERE playroom_id = ? ORDER BY name')
          .bind(playroomId)
          .all()
        return json({ animators: (results ?? []).map(mapAnimator) })
      }
      if (method === 'GET' && resourceId) {
        const row = await db.prepare('SELECT * FROM animators WHERE id = ? AND playroom_id = ?').bind(resourceId, playroomId).first()
        if (!row) return error('Animator not found', 404)
        return json({ animator: mapAnimator(row) })
      }
    }

    if (resource === 'customers') {
      if (method === 'GET' && !resourceId) {
        const customers = await loadCustomers(db, playroomId)
        return json({ customers })
      }
      if (method === 'GET' && resourceId) {
        const row = await db.prepare('SELECT * FROM customers WHERE id = ? AND playroom_id = ?').bind(resourceId, playroomId).first()
        if (!row) return error('Customer not found', 404)
        const { results: childRows } = await db.prepare('SELECT * FROM children WHERE customer_id = ?').bind(resourceId).all()
        return json({ customer: mapCustomer(row, childRows ?? []) })
      }
    }

    if (resource === 'reservations') {
      if (method === 'GET' && !resourceId) {
        const reservations = await listReservations(db, playroomId, url)
        return json({ reservations })
      }
      if (method === 'GET' && resourceId) {
        const reservation = await loadReservation(db, resourceId)
        if (!reservation || reservation.playroomId !== playroomId) return error('Reservation not found', 404)
        return json({ reservation })
      }
      if (method === 'PATCH' && resourceId) {
        const body = await readJsonBody(request)
        if (!body) return error('Invalid JSON body')
        const existing = await loadReservation(db, resourceId)
        if (!existing || existing.playroomId !== playroomId) return error('Reservation not found', 404)

        await db
          .prepare(
            `UPDATE birthday_reservations SET
              status = COALESCE(?, status),
              child_name = COALESCE(?, child_name),
              notes = COALESCE(?, notes),
              internal_notes = COALESCE(?, internal_notes),
              deposit_paid = COALESCE(?, deposit_paid),
              checklist_json = COALESCE(?, checklist_json),
              animator_arrival_status = COALESCE(?, animator_arrival_status),
              updated_at = ?
            WHERE id = ?`,
          )
          .bind(
            body.status ?? null,
            body.childName ?? null,
            body.notes ?? null,
            body.internalNotes ?? null,
            body.depositPaid === undefined ? null : body.depositPaid ? 1 : 0,
            body.checklist ? JSON.stringify(body.checklist) : null,
            body.animatorArrivalStatus ?? null,
            nowIso(),
            resourceId,
          )
          .run()

        if (Array.isArray(body.assignedAnimatorIds)) {
          await db.prepare('DELETE FROM reservation_animators WHERE reservation_id = ?').bind(resourceId).run()
          for (const animatorId of body.assignedAnimatorIds) {
            await db
              .prepare('INSERT OR IGNORE INTO reservation_animators (reservation_id, animator_id) VALUES (?, ?)')
              .bind(resourceId, animatorId)
              .run()
          }
        }

        const reservation = await loadReservation(db, resourceId)
        return json({ reservation })
      }
    }

    if (resource === 'availability' && method === 'GET') {
      const date = url.searchParams.get('date')
      if (!date) return error('Missing date query parameter (YYYY-MM-DD)')
      const reservations = await listReservations(db, playroomId, url)
      const slots = generateAvailableSlots(playroom, date, reservations)
      return json({ date, slots })
    }

    return error(`Not implemented: ${method} /api/partner/${segments.join('/')}`, 501)
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Internal server error', 500)
  }
}
