/**
 * Pure math for the disciplines dial — the circular scrollspy selector
 * measured off the source app. No I/O; fully unit-testable.
 *
 * Source behaviour (verified on the live app):
 * - each of N labels sits at `labelAngle` = index × (360 / N) around a circle
 *   (0° = 12 o'clock, clockwise)
 * - the dial container counter-rotates by `wheelRotation` = -(active × 360 / N)
 *   so the active label always lands upright at the top
 * - clicking a label smooth-scrolls to that discipline's card; the active
 *   index follows the card in view (scrollspy)
 */

export function labelAngle(index: number, count: number): number {
  if (count <= 0) return 0
  return (index % count) * (360 / count)
}

export function wheelRotation(activeIndex: number, count: number): number {
  if (count <= 0) return 0
  const deg = -((activeIndex % count) * (360 / count))
  return deg === 0 ? 0 : deg
}

/**
 * Shortest signed DIAL rotation from active `from` to active `to` on a dial
 * of `count` slots — the dial counter-rotates (rotation(i) = -i*step), so
 * the minimal arc keeps it spinning smoothly instead of unwinding 270°.
 */
export function shortestRotationDelta(from: number, to: number, count: number): number {
  if (count <= 0) return 0
  const step = 360 / count
  let delta = ((from - to) % count) * step
  // On an exact half-turn tie (±180°) prefer the counterclockwise arc —
  // matches the source dial, which spins Yoga -> Pilates as -180°.
  if (delta >= 180) delta -= 360
  if (delta < -180) delta += 360
  return delta
}
