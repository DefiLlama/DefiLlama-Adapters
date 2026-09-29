const sdk = require('@defillama/sdk')
const { getAccountInfo, getPriceFromBiatecClamm } = require('../helper/chain/algorand')

// Biatec CLAMM pool factory/registry app, mainnet. Every pool registers itself here as a box.
// Discovery process documented by the Biatec team at
// https://github.com/scholtz/BiatecCLAMM/blob/main/docusaurus/docs/onchain-tvl-discovery.md
const POOL_PROVIDER_APP_ID = 3074197785

// Each pool registers a box named "fc" + poolAppId(8) + assetA(8) + assetB(8) + ... (59 bytes).
// The box name alone carries the pool's asset pair, so no other read is needed to enumerate pools.
async function getPools() {
  const boxes = await sdk.chains.algorand.getApplicationBoxesAll({ appId: POOL_PROVIDER_APP_ID })
  const pools = []
  for (const box of boxes) {
    const name = Buffer.from(box.name, 'base64')
    if (name.length !== 59) continue
    if (name.toString('ascii', 0, 2) !== 'fc') continue
    pools.push({
      appId: Number(name.readBigUInt64BE(2)),
      assetA: name.readBigUInt64BE(10),
      assetB: name.readBigUInt64BE(18),
    })
  }
  return pools
}

// helper/chain/algorand.js's getAccountInfo represents native ALGO as asset id '1', not the
// real chain id 0 - match that convention when looking up a pool's own holdings.
const assetKey = (assetId) => (assetId === 0n ? '1' : assetId.toString())

async function tvl() {
  const pools = await getPools()

  // Sum only each pool's own two registered assets, never every asset the pool account happens
  // to hold - every pool also custodies its own LP token (often an 18e12+ fixed mint) in its own
  // account, which is a claim on the pool, not separate real TVL.
  const rawBalances = new Map()
  for (const pool of pools) {
    const address = sdk.chains.algorand.getApplicationAddress(pool.appId)
    const account = await getAccountInfo(address)
    for (const assetId of [pool.assetA, pool.assetB]) {
      const holding = account.assetMapping[assetKey(assetId)]
      if (!holding) continue
      rawBalances.set(assetId, (rawBalances.get(assetId) ?? 0n) + BigInt(holding.amount))
    }
  }

  // Value every held asset in terms of whatever DefiLlama already prices (ALGO, USDC, ...).
  // Biatec-only tokens (its governance token, gold-pegged assets, ...) have no external price
  // source at all, so getPriceFromBiatecClamm bridges them to a trusted asset using Biatec's own
  // on-chain VWAP - this never asserts a USD figure itself, only a token-for-token exchange rate;
  // DefiLlama still prices the trusted asset normally. A token with no route anywhere yet (never
  // traded against a trusted asset, even indirectly) is left as its own raw balance instead.
  const balances = {}
  for (const [assetId, raw] of rawBalances) {
    const priced = await getPriceFromBiatecClamm(assetId)
    if (!priced) {
      sdk.util.sumSingleBalance(balances, assetKey(assetId), raw.toString(), 'algorand')
      continue
    }
    const equivalentRaw = Math.round((Number(raw) * priced.price) / 10 ** priced.decimals)
    sdk.util.sumSingleBalance(balances, priced.geckoId, equivalentRaw)
  }

  return balances
}

module.exports = {
  methodology: "Sums each Biatec CLAMM pool's real on-chain asset balances (never its own LP token). Pools are discovered from the pool provider app's box storage, not a hardcoded list. Tokens without an external price source are valued via Biatec's own on-chain VWAP, bridged to a DefiLlama-priced asset (ALGO/USDC/...) rather than assigned a USD figure directly.",
  timetravel: false,
  algorand: {
    tvl,
  },
}
