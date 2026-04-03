const { execSync } = require('child_process');

// --- Configuration (can be overridden via args: node refillHistory.js <adapter> <end> <start>) ---
const ADAPTER = process.argv[2] || 'zest'
const END_STR = process.argv[3] || '2025-05-13'   // most recent day to fill
const START_STR = process.argv[4] || '2024-02-26'  // earliest day to fill
// ------------------------------------------------------------------------------------------------

const ONE_DAY = 24 * 3600
const MAX_CONSECUTIVE_ERRORS = 3

function toUnix(dateStr) {
  const t = Math.floor(new Date(dateStr).getTime() / 1e3)
  if (isNaN(t)) throw new Error(`Invalid date: ${dateStr}`)
  return t
}

const endTs = toUnix(END_STR)
const startTs = toUnix(START_STR)
if (endTs <= startTs) throw new Error('end must be after start')

console.log(`Refilling "${ADAPTER}" from ${END_STR} back to ${START_STR}`)

let consecutiveErrors = 0

for (let ts = endTs; ts >= startTs; ts -= ONE_DAY) {
  const dateStr = new Date(ts * 1e3).toISOString().slice(0, 10)
  // console.log(`\n=== ${dateStr} (ts: ${ts}) ===`)

  try {
    execSync(`npm run start`, {
      stdio: 'inherit',
      env: { ...process.env, RUN_ONLY: ADAPTER, TIMESTAMP: String(ts), REFILL_MODE: 'true', },
    })
    consecutiveErrors = 0
  } catch (e) {
    consecutiveErrors++
    console.error(`[error] day ${dateStr} failed (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS} consecutive)`)
    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      console.error(`[abort] ${MAX_CONSECUTIVE_ERRORS} consecutive days with errors, stopping.`)
      process.exit(1)
    }
  }
}

console.log('\nRefill complete.')
