const axios = require('axios')
const { getApplicationAddress } = require('./helper/chain/algorandUtils/address')
const { sumTokens } = require('./helper/chain/algorand')

// Biatec CLAMM pool factory/registry app, mainnet. Pools register themselves here as boxes.
// Discovery process documented by the Biatec team at
// https://github.com/scholtz/BiatecCLAMM/blob/main/docusaurus/docs/onchain-tvl-discovery.md
const POOL_PROVIDER_APP_ID = 3074197785

const algod = axios.create({
  baseURL: 'https://mainnet-api.algonode.cloud',
  timeout: 300000,
})

// Each pool is registered as a box named "fc" + poolAppId(8) + assetA(8) + assetB(8) + ... (59 bytes total).
async function getPoolAppIds() {
  const { data } = await algod.get(`/v2/applications/${POOL_PROVIDER_APP_ID}/boxes`)
  const poolAppIds = []
  for (const box of data.boxes ?? []) {
    const name = Buffer.from(box.name, 'base64')
    if (name.length !== 59) continue
    if (name.toString('ascii', 0, 2) !== 'fc') continue
    poolAppIds.push(Number(name.readBigUInt64BE(2)))
  }
  return poolAppIds
}

async function tvl() {
  const poolAppIds = await getPoolAppIds()
  const owners = poolAppIds.map(getApplicationAddress)
  return sumTokens({ owners })
}

module.exports = {
  methodology: "Sums the actual ALGO/ASA balances held by each Biatec CLAMM pool's on-chain account. Pools are discovered from the pool provider app's box storage, not a hardcoded list.",
  algorand: {
    tvl,
  },
}
