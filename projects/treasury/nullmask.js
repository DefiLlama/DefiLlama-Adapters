const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require('../helper/treasury')

const POOL = '0xd64EF1417EB047ed0b54736a5a41F01178C391c6' // Nullmask shielded pool
const MASK = 'HuAXPyDWDaMYFKuwQHpqL1oPnj93zdzWmtvFGzCeCUa7' // MASK (Solana, Token-2022)

const EVM_FEE_WALLET = '0xb1f6793a892bad823f97e0b714b4dd8aee7059e9' // receives protocol fees swept from the pool
const SOL_OPS_WALLET = 'GRbpmTbmDeGn8BXHXb1jfEeUT6sGAt7Da44YpWxCS8nr' // receives bridged fees (deBridge), holds purchased MASK
const SOL_TEAM_WALLET = 'FrXTvkebakR2oNctgsHz1yeijmu9wTZifL3FmffJP5xJ' // team wallet, receives ZEC holder rewards

const TOKENS = [nullAddress, ADDRESSES.ethereum.USDT]

const base = treasuryExports({
  ethereum: {
    owners: [EVM_FEE_WALLET],
    tokens: TOKENS,
  },
  solana: {
    owners: [SOL_OPS_WALLET, SOL_TEAM_WALLET],
    ownTokens: [MASK],
  },
})

// protocol fees accrued in the pool contract and not yet swept are protocol funds as well
// (they are excluded from the Nullmask pool TVL)
const baseEthTvl = base.ethereum.tvl
base.ethereum.tvl = async (api) => {
  await baseEthTvl(api)
  const accrued = await api.multiCall({ abi: 'function protocolFeesAccrued(address) view returns (uint256)', target: POOL, calls: TOKENS })
  TOKENS.forEach((token, i) => api.add(token, accrued[i]))
  return api.getBalances()
}

module.exports = base
