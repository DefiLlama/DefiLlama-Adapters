/* Saturn (saturn.tg) — DefiLlama adapter. SAT-366, 2026-09-20.
 *
 * Submitted to DefiLlama-Adapters as `projects/saturn-tg/index.js`. It reads the
 * SAME facts the site's own TVL reads (frontend/src/lib/saturnTvl.ts), so the
 * listing and the home page agree by construction:
 *
 *   · member principal in Saturn's custody staking pools — each pool contract's
 *     own `principal` getter (credited, available, reserved, in-flight); the
 *     AVAILABLE figure is what the site shows as staked;
 *   · staked STON.fi v2 LP unwrapped to its two reserves pro rata
 *     (LP share × reserve), so DefiLlama prices the underlying coins rather
 *     than an LP token nobody quotes.
 *
 * What is deliberately NOT counted: the house's reward inventory sitting in the
 * same pools (protocol-owned), and the STON.fi pools' liquidity itself (that is
 * STON.fi's TVL — Saturn owns no spot pool).
 *
 * Categories, declared rather than discovered: GSC is the house token, so staked
 * GSC/GRAM LP is `pool2`. DIGGY was launched THROUGH Saturn and is not the
 * house token, so DIGGY staking and DIGGY/GRAM LP staking are plain `tvl`.
 */
const ADDRESSES = require("../helper/coreAssets.json");
const { call } = require("../helper/chain/ton");

const GSC = "EQAmaMdwCmpZNJSRfvbNZDu1HkjFbw2VtvvI1FDKvLJMgyXE";
const DIGGY = "EQAmTUciPykaNw5bZ9DlYXzpB9vFjUZOd5re_TiCHbaYmzvU";

// Saturn custody staking pools, v4 generation (code 006241e8…, published 2026-09-14).
// `lp` is the STON.fi v2 pool, which is also the LP jetton master.
const POOLS = {
  GSC_GRAM_LP: { pool: "EQA4kjPVv0bs_Er6jYk5WVMkG5zZlRD6uP97z3J6tIaDpP16", lp: "EQDnM9s34Nkies0Cf7nFUUlq8irtXF1w9SE63_T3mgKTPxaw", token: GSC },
  DIGGY_GRAM_LP: { pool: "EQCy381qGkqSoSobioVdSKK6WA5KoO9OMtyOA8zsUD8ibpAS", lp: "EQCbi6UOBSwaNAlgFhPbdbHvoszro-_fPqT2CGnEjHKwwBbL", token: DIGGY },
  DIGGY: { pool: "EQDEmMYgoV66hJN_JfDcve0hhq_G6wNNAnf7EQd_-YOLMK9i", token: DIGGY },
};

// toncenter's public runGetMethod is rate-limited (~1 request/s without a key)
// and the harness runs tvl and pool2 in parallel, so every getter call goes
// through one queue with a second between calls. Five calls, six seconds.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let queue = Promise.resolve();
const throttled = (fn) => {
  const run = queue.then(fn);
  queue = run.catch(() => {}).then(() => sleep(1100));
  return run;
};

// The helper parses `num` entries with parseInt(hex, 16); pool reserves exceed
// 2^53, so read the raw stack and keep exact integers.
async function nums(target, abi) {
  const stack = await throttled(() => call({ target, abi, rawStack: true }));
  return stack.map(([type, value]) => (type === "num" ? BigInt(value) : value));
}

// `principal()` -> (credited, available, reserved, inFlight); available is the staked figure.
async function stakedUnits(pool) {
  const [, available] = await nums(pool, "principal");
  return available;
}

// STON.fi v2 pool `get_pool_data` -> [.., .., lpSupply, reserve0, reserve1, ..].
// On both house pools token0 is pTON (native) and token1 the jetton; verified
// against the pools' USD liquidity on 2026-09-20.
async function lpToReserves(lpMaster, lpUnits) {
  const data = await nums(lpMaster, "get_pool_data");
  const supply = data[2], r0 = data[3], r1 = data[4];
  if (supply === 0n || lpUnits === 0n) return { ton: 0n, jetton: 0n };
  return { ton: (r0 * lpUnits) / supply, jetton: (r1 * lpUnits) / supply };
}

// GSC and DIGGY are booked as raw jetton amounts; they count once DefiLlama prices them.
async function addLpPool(api, { pool, lp, token }) {
  const units = await stakedUnits(pool);
  const { ton, jetton } = await lpToReserves(lp, units);
  api.add(ADDRESSES.ton.TON, ton.toString());
  api.add(token, jetton.toString());
}

module.exports = {
  timetravel: false,
  methodology:
    "Member deposits in Saturn's custody staking pools, read from each pool's `principal` getter. Staked STON.fi LP is unwrapped to its pro-rata share of the pool reserves. GSC and DIGGY are reported as token amounts and count only once DefiLlama has a price for them. House reward inventory held in the same pools is excluded. GSC is the house token, so staked GSC/GRAM LP is reported under pool2; DIGGY and DIGGY/GRAM LP staking are TVL.",
  ton: {
    tvl: async (api) => {
      api.add(DIGGY, (await stakedUnits(POOLS.DIGGY.pool)).toString());
      await addLpPool(api, POOLS.DIGGY_GRAM_LP);
    },
    pool2: async (api) => {
      await addLpPool(api, POOLS.GSC_GRAM_LP);
    },
  },
};
