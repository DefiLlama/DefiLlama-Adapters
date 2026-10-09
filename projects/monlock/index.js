const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

// Every MonLock launch has its own bonding curve contract, which holds the MON raised until the curve sells out.
// Then the liquidity moves to a Uniswap v4 pool, where it is locked and counted under Uniswap v4, not here.
const FACTORY = '0x3Ec6905A80A8E981159fF7EA1Ee48C60eD737920'
const FROM_BLOCK = 109741113

const TokenCreated = 'event TokenCreated(address indexed token, address indexed curve, address indexed creator, address deployer, uint32 presetId, string name, string symbol, string metadataURI, bytes context)'

async function tvl(api) {
  const logs = await getLogs2({ api, target: FACTORY, fromBlock: FROM_BLOCK, eventAbi: TokenCreated })
  return api.sumTokens({ owners: logs.map((log) => log.curve), tokens: [ADDRESSES.null] })
}

module.exports = {
  methodology: 'Counts the MON held by the bonding curves of the tokens launched on MonLock. When a curve sells out, its liquidity moves to a Uniswap v4 pool, which is counted under Uniswap v4.',
  start: '2026-10-01',
  monad: { tvl },
}
