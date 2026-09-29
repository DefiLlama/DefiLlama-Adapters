const sdk = require('@defillama/sdk')
const { sumTokens } = require('../helper/chain/algorand')

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
// real chain id 0 - match that convention so sumTokens's tokensAndOwners lookup finds it.
const assetKey = (assetId) => (assetId === 0n ? '1' : assetId.toString())

async function tvl() {
  const pools = await getPools()

  // Sum only each pool's own two registered assets, never every asset the pool account happens
  // to hold - every pool also custodies its own LP token (often an 18e12+ fixed mint) in its own
  // account, which is a claim on the pool, not separate real TVL. tokensAndOwners restricts each
  // owner lookup to exactly the one token paired with it, instead of summing the whole account.
  const tokensAndOwners = []
  for (const pool of pools) {
    const address = sdk.chains.algorand.getApplicationAddress(pool.appId)
    tokensAndOwners.push([assetKey(pool.assetA), address])
    tokensAndOwners.push([assetKey(pool.assetB), address])
  }

  return sumTokens({ tokensAndOwners })
}

module.exports = {
  methodology: "Sums each Biatec CLAMM pool's real on-chain asset balances (never its own LP token). Pools are discovered from the pool provider app's box storage, not a hardcoded list.",
  timetravel: false,
  algorand: {
    tvl,
  },
}
