const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

// Prismapad launchpad on Stable (chain id 988).
// v1 (bonding curve, legacy):
// https://stablescan.xyz/address/0xdcb881fc8b472eb7797687b237e6cb123c425ff7#code
// v2 (direct-to-DEX — every token launches straight into an official
// StableSwap (Uniswap v3) pool; the LP position is locked in the launchpad):
// https://stablescan.xyz/address/0xa96d9eadc4d6eed50fa408a33585c5f1df039db5#code
const LAUNCHPAD_V1 = '0xdcb881fc8b472eb7797687b237e6cb123c425ff7'
const LAUNCHPAD_V2 = '0xa96d9eadc4d6eed50fa408a33585c5f1df039db5'
const V2_DEPLOY_BLOCK = 32896230

const TOKEN_CREATED_V2 =
  'event TokenCreated(address indexed token, address indexed creator, address pool, uint256 positionId, string name, string symbol, string metadataURI)'

module.exports = {
  methodology:
    'TVL is the USDT0 side of Prismapad liquidity: the bonding-curve reserves held by the legacy v1 launchpad, plus the USDT0 in every v2 token\'s StableSwap (Uniswap v3) pool — v2 pools hold only liquidity minted and permanently locked by the launchpad contract.',
  doublecounted: true, // v2 pool liquidity also counts toward stableswap-xyz-v3
  start: '2026-07-23',
  stable: {
    tvl: async (api) => {
      const launches = await getLogs({
        api,
        target: LAUNCHPAD_V2,
        eventAbi: TOKEN_CREATED_V2,
        fromBlock: V2_DEPLOY_BLOCK,
        onlyArgs: true,
      })
      const owners = [LAUNCHPAD_V1, ...launches.map((l) => l.pool)]
      return api.sumTokens({ owners, tokens: [ADDRESSES.stable.USDT0] })
    },
  },
}
