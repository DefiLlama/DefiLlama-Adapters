const { getConfig } = require('../helper/cache')
const { sumTokens, getApplicationAddress, getAppGlobalState } = require('../helper/chain/algorand')

// Fry Networks own/reward tokens — counted as staking, not TVL
const FRY2 = '2485314946'
const FRY3 = '3612979527'
const FNODE = '2485202024'
const FVPN = '2485198745'
const OWN_TOKENS = [FRY2, FRY3, FNODE, FVPN]

let poolsPromise
async function getPools() {
  if (!poolsPromise) poolsPromise = _getPools()
  return poolsPromise

  async function _getPools() {
    const [farming, staking] = await Promise.all([
      getConfig('fry-farm/farming', 'https://fry.farm/api/farming/all'),
      getConfig('fry-farm/staking', 'https://fry.farm/api/staking/all'),
    ])
    const pairMap = {}
    const ids = new Set()
    for (const p of farming.data ?? []) {
      if (!p.appId) continue
      ids.add(+p.appId)
      if (p.lpToken) pairMap[+p.appId] = [String(p.lpToken.tokenA), String(p.lpToken.tokenB)]
    }
    for (const p of staking.data ?? [])
      if (p.stakingContractId && p.chainId === 'algorand-mainnet') ids.add(+p.stakingContractId)

    const states = await Promise.all([...ids].map(id => getAppGlobalState(id)))
    const pools = []
    ;[...ids].forEach((id, i) => {
      const state = states[i]
      if (!state.stake_token) return
      pools.push({ id, address: getApplicationAddress(id), stakeToken: String(state.stake_token), pair: pairMap[id] })
    })
    return pools
  }
}

// Only the staked token is counted at each pool account, so pre-funded reward
// balances sitting in the same account are excluded.
async function tvl(api) {
  const pools = await getPools()
  const tokensAndOwners = []
  const tinymanLps = []
  for (const p of pools) {
    if (OWN_TOKENS.includes(p.stakeToken)) continue
    tokensAndOwners.push([p.stakeToken, p.address])
    if (p.pair && !p.pair.includes(p.stakeToken)) {
      // staked token is an LP ASA — resolve to underlyings, doubling the priced side when paired with an own token
      const unknown = p.pair.find(t => OWN_TOKENS.includes(t))
      tinymanLps.push([p.stakeToken, unknown])
    }
  }
  return sumTokens({ api, tokensAndOwners, tinymanLps, blacklistedTokens: OWN_TOKENS, blacklistOnLpAsWell: true })
}

async function staking(api) {
  const pools = await getPools()
  const tokensAndOwners = pools
    .filter(p => OWN_TOKENS.includes(p.stakeToken))
    .map(p => [p.stakeToken, p.address])
  return sumTokens({ api, tokensAndOwners })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL sums the staked assets (USDC, Tinyman LP tokens and other ASAs) held by fry.farm staking and farming pool application accounts on Algorand. Pool app ids come from the public fry.farm pool registry (fry.farm/api/farming/all and /api/staking/all); the staked asset of each pool and all balances are read on-chain. LP positions are resolved to their underlying assets. Fry Networks own tokens (FRY, fNODE, fVPN) staked in pools are reported under staking.',
  algorand: { tvl, staking },
}
