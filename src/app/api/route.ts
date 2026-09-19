import { NextResponse } from 'next/server'

/**
 * Liveness probe: answers 200 with a timestamped payload the moment the
 * process is serving. Deliberately DB-free — a DB outage must not mask a
 * dead process (or vice versa).
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'aura-studio',
    timestamp: new Date().toISOString(),
  })
}
