const sdk = require('@defillama/sdk')
const { sumTokens } = require('../helper/chain/algorand')

// Biatec CLAMM pool provider app; every pool registers a box here
const POOL_PROVIDER_APP_ID = 3074197785

async function getPools() {
  const boxes = await sdk.chains.algorand.getApplicationBoxesAll({ appId: POOL_PROVIDER_APP_ID })
  const pools = []
  for (const box of boxes) {
    const name = Buffer.from(box.name, 'base64')
    // pool box: "fc" + poolAppId + assetA + assetB + ... (59 bytes)
    if (name.length !== 59 || name.toString('ascii', 0, 2) !== 'fc') continue
    pools.push({
      appId: Number(name.readBigUInt64BE(2)),
      assetA: name.readBigUInt64BE(10),
      assetB: name.readBigUInt64BE(18),
    })
  }
  return pools
}

// the algorand helper keys native ALGO as '1'
const assetKey = (assetId) => (assetId === 0n ? '1' : assetId.toString())

async function tvl() {
  const pools = await getPools()
  // only each pool's two registered assets, not the LP token it also holds
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
