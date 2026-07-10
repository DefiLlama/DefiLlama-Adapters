const sdk = require('@defillama/sdk')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getUniqueAddresses } = require('../helper/tokenMapping')

const activeTokensAbi = 'function getActiveTokens() view returns ((address[] activeTokens, address baseToken))'
const activeAppsAbi = 'function getActiveApplications() view returns (uint256)'
const appBalancesAbi = 'function getAppTokenBalances(uint256) returns (((address,int256)[],uint256)[])'

const REGISTRY = '0x06767e8090bA5c4Eca89ED00C3A719909D503ED6' // same on all chains

module.exports = {
  methodology: 'RigoBlock TVL is computed by summing the on-chain token balances held by each smart pool and the token balances of its external positions, as reported by the protocol\'s own NAV method. GRG is excluded from TVL and reported separately as staking.',
}

const config = {
  ethereum: {
    fromBlock: 15817831,
    GRG_TOKEN_ADDRESS: '0x4FbB350052Bca5417566f188eB2EBCE5b19BC964',
  },
  arbitrum: {
    fromBlock: 32290603,
    GRG_TOKEN_ADDRESS: '0x7F4638A58C0615037deCc86f1daE60E55fE92874',
  },
  optimism: {
    fromBlock: 31239008,
    GRG_TOKEN_ADDRESS: '0xEcF46257ed31c329F204Eb43E254C609dee143B3',
  },
  bsc: {
    fromBlock: 25550259,
    GRG_TOKEN_ADDRESS: '0x3d473C3eF4Cd4C909b020f48477a2EE2617A8e3C',
  },
  base: {
    fromBlock: 2568188,
    GRG_TOKEN_ADDRESS: '0x09188484e1Ab980DAeF53a9755241D759C5B7d60',
  },
  unichain: {
    fromBlock: 16121670,
    GRG_TOKEN_ADDRESS: '0x03C2868c6D7fD27575426f395EE081498B1120dd',
  },
  polygon: {
    fromBlock: 34751611,
    GRG_TOKEN_ADDRESS: '0xbc0bea8e634ec838a2a45f8a43e7e16cd2a8ba99',
  },
}

Object.keys(config).forEach(chain => {
  const { fromBlock, GRG_TOKEN_ADDRESS } = config[chain]
  const poolInfoByBlock = {} // cached per block, shared by tvl and staking

  async function getPoolInfo(api) {
    const block = api.block
    if (!poolInfoByBlock[block]) poolInfoByBlock[block] = _getPoolInfo(api)
    return poolInfoByBlock[block]
  }

  module.exports[chain] = {
    tvl: async (api) => {
      const { pools, tokens, appBalances } = await getPoolInfo(api)

      // Add external application balances (everything except GRG)
      for (const { token, amount } of appBalances) {
        if (token.toLowerCase() === GRG_TOKEN_ADDRESS.toLowerCase()) continue
        if (BigInt(amount) !== 0n) api.add(token, amount)
      }

      // Add smart pool owned token balances (excluding GRG)
      return sumTokens2({ owners: pools, tokens, api, blacklistedTokens: [GRG_TOKEN_ADDRESS] })
    },
    staking: async (api) => {
      const { pools, appBalances } = await getPoolInfo(api)

      // Add GRG balances from external applications
      for (const { token, amount } of appBalances) {
        if (token.toLowerCase() === GRG_TOKEN_ADDRESS.toLowerCase() && BigInt(amount) !== 0n) {
          api.add(GRG_TOKEN_ADDRESS, amount)
        }
      }

      // Add GRG balances held directly by smart pools
      return sumTokens2({ owners: pools, tokens: [GRG_TOKEN_ADDRESS], api })
    },
  }

  async function _getPoolInfo(api) {
    // Fetch pool addresses from registry logs
    const registeredLogs = await getLogs({
      api,
      target: REGISTRY,
      fromBlock,
      topic: 'Registered(address,address,bytes32,bytes32,bytes32)',
      onlyArgs: true,
      eventAbi: 'event Registered(address indexed group, address pool, bytes32 indexed name, bytes32 indexed symbol, bytes32 id)'
    })
    const pools = registeredLogs.map(i => i.pool)

    // Fetch active tokens and active application flags for each pool in parallel
    const [tokenData, appFlags] = await Promise.all([
      api.multiCall({
        abi: activeTokensAbi,
        calls: pools,
        permitFailure: true, // V3 pools do not have activeTokens
      }),
      api.multiCall({
        abi: activeAppsAbi,
        calls: pools,
        permitFailure: true, // V3 pools do not have getActiveApplications
      }),
    ])

    const validTokenData = tokenData.filter(data => data !== null)
    const tokens = validTokenData.flatMap(i => i.activeTokens)
    const baseTokens = validTokenData.map(i => i.baseToken).filter(Boolean)
    const uniqueTokens = getUniqueAddresses([...tokens, ...baseTokens])

    // Fetch all external application token balances for each pool
    const appBalancesData = await api.multiCall({
      abi: appBalancesAbi,
      calls: pools.map((pool, i) => ({ target: pool, params: [appFlags[i] ?? 0] })),
      permitFailure: true,
    })

    // Aggregate external application balances by token across all pools
    const appBalanceMap = new Map()
    for (let i = 0; i < pools.length; i++) {
      const poolApps = appBalancesData[i]
      if (!poolApps) continue
      for (const app of poolApps) {
        const [balances] = app
        for (const [token, amount] of balances) {
          const tokenKey = token.toLowerCase()
          const current = appBalanceMap.get(tokenKey) || { token, amount: 0n }
          current.amount += BigInt(amount)
          appBalanceMap.set(tokenKey, current)
        }
      }
    }
    const appBalances = Array.from(appBalanceMap.values())

    sdk.log('chain: ', api.chain, 'pools: ', pools.length, 'tokens: ', uniqueTokens.length, 'app balance entries: ', appBalances.length)
    return { pools, tokens: uniqueTokens, appBalances }
  }
})
