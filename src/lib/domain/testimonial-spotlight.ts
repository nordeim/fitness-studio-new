/**
 * Testimonial spotlight — the rotation engine measured off the source app:
 * once the band scrolls into view, the three cards run a spotlight cycle
 * (~3s per slot) where exactly one card shows its quote face (cream card)
 * while the other two show their giant-number face over the photo. Hovering
 * (or focusing) a card freezes the cycle on it — only the hovered card's
 * quote is visible, active index notwithstanding. Before the band is
 * revealed every card shows its quote face.
 *
 * Pure state math; no I/O, no timers.
 */

export interface SpotlightState {
  /** false until the band has entered the viewport (rotation armed) */
  revealed: boolean
  /** the card whose quote face is lit by the rotation */
  active: number
  /** the hovered/focused card, if any — freezes the rotation */
  hovered: number | null
}

/** Whether card `i` currently shows its quote face (true) or number face. */
export function quoteFaceVisible(i: number, state: SpotlightState): boolean {
  if (!state.revealed) return true
  if (state.hovered !== null) return i === state.hovered
  return i === state.active
}

/** The next active index in the forward-wrapping rotation. */
export function nextActive(active: number, total: number): number {
  return (active + 1) % total
}
