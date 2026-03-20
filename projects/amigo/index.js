const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

const ROUTER = "0x4B48F3D1Ddc9e5793D4817517255e6beF6d72A7C"
const WETH = "0x3439153EB7AF838Ad19d56E1571FBD09333C2809"
const DEPLOY_BLOCK = 41117113

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: ROUTER,
    eventAbi: "event PoolCreated(address indexed pool, address indexed creator, address indexed referrer, uint256 curveId)",
    fromBlock: DEPLOY_BLOCK,
  })
  const pools = logs.map(l => l.pool)
  return sumTokens2({ api, owners: pools, tokens: [WETH] })
}

module.exports = {
  methodology: "WETH locked in Amigo bonding curve pools",
  start: '2026-02-18',
  abstract: { tvl },
}
