const { sumTokens2 } = require('../helper/solana')
const { sumTokens2: sumEvmTokens, nullAddress } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

const TOKEN_VAULT = '2sjnjABJHPEZS8oVdp8nztPBUVUAT7uJawc8eQTMHTfa'
const SOL_VAULT = 'BxDCkvgZYRcCAnpywVw5j14AhkXehYvsXoCRiaodUs8s'

const UMBRA_MINT = 'PRVT6TB7uss3FrUd2D9xs2zqDBsa3GbMJMwCQsgmeta'

// Robinhood Chain: one contract (an ERC1967 proxy) holds every asset. ETH is held natively,
// since WETH deposits are unwrapped. Which tokens it holds is governance state, replayed from
// AssetAllowanceSet since deployment.
const ROBINHOOD_POOL = '0x1224BE8AE49a1795158AcEC97698E8B122a19740'
const ROBINHOOD_POOL_DEPLOY_BLOCK = 95118358

async function tvl(api) {
  return sumTokens2({ api, owner: TOKEN_VAULT, solOwners: [SOL_VAULT], blacklistedTokens: [UMBRA_MINT] })
}

async function staking(api) {
  return sumTokens2({ api, tokensAndOwners: [[UMBRA_MINT, TOKEN_VAULT]] })
}

async function robinhoodTvl(api) {
  const logs = await getLogs2({
    api,
    target: ROBINHOOD_POOL,
    eventAbi: 'event AssetAllowanceSet(address indexed asset, bool allowed)',
    fromBlock: ROBINHOOD_POOL_DEPLOY_BLOCK,
  })
  const allowed = new Map()
  for (const { asset, allowed: isAllowed } of logs) allowed.set(asset.toLowerCase(), isAllowed)
  const tokens = [...allowed].filter(([, isAllowed]) => isAllowed).map(([asset]) => asset)
  return sumEvmTokens({ api, owner: ROBINHOOD_POOL, tokens: [nullAddress, ...tokens] })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the sum of the token balances held by the Umbra V2 shielded pools, read directly from chain state. On Solana, V2 custodies every SPL token deposit in token accounts owned by a single vault authority, and native SOL deposits as the lamport balance of a single program-owned vault. On Robinhood Chain, a single pool contract holds every allowed asset, with ETH held natively. Nothing is borrowed, lent or rehypothecated by Umbra itself, and Umbra\'s own token is counted under staking where users have deposited it into the pool.',
  solana: { tvl, staking },
  robinhood: { tvl: robinhoodTvl },
}
