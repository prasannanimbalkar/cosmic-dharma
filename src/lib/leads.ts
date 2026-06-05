import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface LeadPayload {
  email: string
  name?: string
}

export type SaveLeadResult =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'invalid_email' | 'network'; message?: string }

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key || key.includes('PASTE_YOUR')) return null
  if (!supabase) supabase = createClient(url, key)
  return supabase
}

export function isLeadCaptureEnabled(): boolean {
  return Boolean(getSupabase() || import.meta.env.VITE_LEADS_WEBHOOK_URL)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/** Saves only email, name, and created_at — no birth chart data. */
export async function saveLead(payload: LeadPayload): Promise<SaveLeadResult> {
  const email = payload.email.trim().toLowerCase()
  if (!isValidEmail(email)) {
    return { ok: false, reason: 'invalid_email' }
  }

  const row = {
    email,
    name: payload.name?.trim() || null,
    created_at: new Date().toISOString(),
  }

  const client = getSupabase()
  if (client) {
    const { error } = await client.from('leads').insert(row)
    if (error) {
      return { ok: false, reason: 'network', message: error.message }
    }
    return { ok: true }
  }

  const webhook = import.meta.env.VITE_LEADS_WEBHOOK_URL
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(row),
      })
      if (!res.ok) {
        return { ok: false, reason: 'network', message: `HTTP ${res.status}` }
      }
      return { ok: true }
    } catch (e) {
      return {
        ok: false,
        reason: 'network',
        message: e instanceof Error ? e.message : 'Request failed',
      }
    }
  }

  return { ok: false, reason: 'not_configured' }
}
