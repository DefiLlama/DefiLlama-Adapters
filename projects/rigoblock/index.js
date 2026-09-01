const sdk = require('@defillama/sdk')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getUniqueAddresses } = require('../helper/tokenMapping')

const activeTokensAbi = 'function getActiveTokens() view returns ((address[] activeTokens, address baseToken))'
const tokenIdsAbi = 'function getUniV4TokenIds() view returns (uint256[])'
const ownerOfAbi = 'function ownerOf(uint256 tokenId) view returns (address)'
// rigoblock external positions ref: https://github.com/RigoBlock/v3-contracts/blob/5f6ff38e8d88d66e83d71523d3688c21174837c4/contracts/protocol/extensions/EApps.sol#L53
const activeAppsAbi = 'function getActiveApplications() view returns (uint256)'

const REGISTRY = '0x06767e8090bA5c4Eca89ED00C3A719909D503ED6' // same on all chains

// Applications enum: https://github.com/RigoBlock/v3-contracts/tree/development/contracts/protocol/types/Applications.sol
const GMX_APP_INDEX = 2
const GMX_FLAG = 1 << GMX_APP_INDEX

const GMX = {
  arbitrum: { reader: '0xf60becbba223EEA9495Da3f606753867eC10d139', dataStore: '0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8' },
}
const getAccountPositionsAbi = 'function getAccountPositions(address dataStore, address account, uint256 start, uint256 end) view returns (((address account, address market, address collateralToken) addresses, (uint256 sizeInUsd, uint256 sizeInTokens, uint256 collateralAmount, uint256 borrowingFactor, uint256 fundingFeeAmountPerSize, uint256 longTokenClaimableFundingAmountPerSize, uint256 shortTokenClaimableFundingAmountPerSize, uint256 increasedAtBlock, uint256 decreasedAtBlock) numbers, (bool isLong) flags)[])'

async function addGmxPositions(api, gmxPools, blacklistedTokens = []) {
  const gmx = GMX[api.chain]
  if (!gmx || !gmxPools.length) return
  const positionsByPool = await api.multiCall({
    abi: getAccountPositionsAbi,
    target: gmx.reader,
    calls: gmxPools.map(pool => ({ params: [gmx.dataStore, pool, 0, 1000] })),
    permitFailure: true,
  })
  const blacklist = new Set(blacklistedTokens.map(t => t.toLowerCase()))
  for (const positions of positionsByPool) {
    if (!positions) continue
    for (const p of positions) {
      const token = p.addresses.collateralToken
      if (blacklist.has(token.toLowerCase())) continue
      api.add(token, p.numbers.collateralAmount)
    }
  }
}

module.exports = {
  methodology: `RigoBlock TVL on Ethereum, Arbitrum, Optimism, BSC, Base, and Unichain pulled from onchain data, including Uniswap V4 liquidity position balances and collateral held in GMX v2 positions, excluding GRG balances. Staking TVL includes staked GRG, plus GRG balances in Uniswap V4 liquidity positions, and GRG balances held by smart pool contracts.`,
}

const config = {
  ethereum: {
    fromBlock: 15817831,
    GRG_VAULT_ADDRESSES: '0xfbd2588b170Ff776eBb1aBbB58C0fbE3ffFe1931',
    GRG_TOKEN_ADDRESSES: '0x4FbB350052Bca5417566f188eB2EBCE5b19BC964',
    UNISWAP_V4_POSM: '0xbD216513d74C8cf14cf4747E6AaA6420FF64ee9e',
  },
  arbitrum: {
    fromBlock: 32290603,
    GRG_VAULT_ADDRESSES: '0xE86a667F239A2531C9d398E81154ba125030497e',
    GRG_TOKEN_ADDRESSES: '0x7F4638A58C0615037deCc86f1daE60E55fE92874',
    UNISWAP_V4_POSM: '0xd88F38F930b7952f2DB2432Cb002E7abbF3dD869',
  },
  optimism: {
    fromBlock: 31239008,
    GRG_VAULT_ADDRESSES: '0x5932C223186F7856e08A1D7b35ACc2Aa5fC57BfD',
    GRG_TOKEN_ADDRESSES: '0xEcF46257ed31c329F204Eb43E254C609dee143B3',
    UNISWAP_V4_POSM: '0x3C3Ea4B57a46241e54610e5f022E5c45859A1017',
  },
  bsc: {
    fromBlock: 25550259,
    GRG_VAULT_ADDRESSES: '0x5494B4193961a467039B92CCfE0138Fe353240d6',
    GRG_TOKEN_ADDRESSES: '0x3d473C3eF4Cd4C909b020f48477a2EE2617A8e3C',
    UNISWAP_V4_POSM: '0x7A4a5c919aE2541AeD11041A1AEeE68f1287f95b',
  },
  base: {
    fromBlock: 2568188,
    GRG_VAULT_ADDRESSES: '0x7a7fa66B97a9e009ecAB4bCD62e87b2c0b65F21D',
    GRG_TOKEN_ADDRESSES: '0x09188484e1Ab980DAeF53a9755241D759C5B7d60',
    UNISWAP_V4_POSM: '0x7C5f5A4bBd8fD63184577525326123B519429bDc',
  },
  unichain: {
    fromBlock: 16121670,
    GRG_VAULT_ADDRESSES: '0x448366d7C2e0af67D3723De875b7eAf548474A37',
    GRG_TOKEN_ADDRESSES: '0x03C2868c6D7fD27575426f395EE081498B1120dd',
    UNISWAP_V4_POSM: '0x4529A01c7A0410167c5740C487A8DE60232617bf',
  },
}

Object.keys(config).forEach(chain => {
  const { fromBlock, GRG_TOKEN_ADDRESSES, GRG_VAULT_ADDRESSES, UNISWAP_V4_POSM } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const { pools, tokens, uniV4Ids, gmxPools } = await getPoolInfo(api)
      await sumTokens2({ owner: UNISWAP_V4_POSM, tokens, api, blacklistedTokens: [GRG_TOKEN_ADDRESSES], resolveUniV4: true, uniV4ExtraConfig: { positionIds: uniV4Ids } })
      await addGmxPositions(api, gmxPools, [GRG_TOKEN_ADDRESSES])
      return sumTokens2({ owners: pools, tokens, api, blacklistedTokens: [GRG_TOKEN_ADDRESSES] })
    },
    staking: async (api) => {
      const { pools, uniV4Ids } = await getPoolInfo(api)
      // Add GRG balances from vaults
      const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: pools, target: GRG_VAULT_ADDRESSES })
      bals.forEach(i => api.add(GRG_TOKEN_ADDRESSES, i))
      // Aggregate GRG from vaults, ERC20 pool balances, and Uniswap V4 positions in a single call
      await sumTokens2({ owner: UNISWAP_V4_POSM, tokens: [GRG_TOKEN_ADDRESSES], api, uniV3WhitelistedTokens: [GRG_TOKEN_ADDRESSES], resolveUniV4: true, uniV4ExtraConfig: { positionIds: uniV4Ids } })
      return sumTokens2({ owners: pools, tokens: [GRG_TOKEN_ADDRESSES], api, uniV3WhitelistedTokens: [GRG_TOKEN_ADDRESSES] })
    },
  }

  async function getPoolInfo(api) {
    const poolKey = `${api.chain}-${api.block}`
    if (!poolData[poolKey]) poolData[poolKey] = _getPoolInfo()
    return poolData[poolKey]

    async function _getPoolInfo() {
      // Fetch pool addresses from registry logs
      const registeredLogs = await getLogs2({
        api,
        target: REGISTRY,
        fromBlock,
        topic: 'Registered(address,address,bytes32,bytes32,bytes32)',
        eventAbi: 'event Registered(address indexed group, address pool, bytes32 indexed name, bytes32 indexed symbol, bytes32 id)'
      })
      const pools = registeredLogs.map(i => i.pool)

      // Fetch active tokens and base token for each pool
      const tokenData = await api.multiCall({
        abi: activeTokensAbi,
        calls: pools,
        permitFailure: true, // V3 pools do not have activeTokens
      })
      const validTokenData = tokenData.filter(data => data !== null)

      const tokens = validTokenData.flatMap(i => i.activeTokens)
      const baseTokens = validTokenData.map(i => i.baseToken).filter(Boolean)
      const allTokens = [...tokens, ...baseTokens]

      // Fetch Uniswap V4 position tokenIds and active application flags for all pools
      const [tokenIdsData, activeApps] = await Promise.all([
        api.multiCall({
          abi: tokenIdsAbi,
          calls: pools,
          permitFailure: true, // Allow pools without tokenIds
        }),
        api.multiCall({
          abi: activeAppsAbi,
          calls: pools,
          permitFailure: true, // Allow pools without getActiveApplications
        }),
      ])

      // Pools that have GMX v2 positions active
      const gmxPools = pools.filter((_, i) => activeApps[i] && (BigInt(activeApps[i]) & BigInt(GMX_FLAG)) !== 0n)

      // Prepare Uniswap V4 position IDs
      const uniV4Ids = []
      for (let i = 0; i < pools.length; i++) {
        const pool = pools[i]
        const tokenIds = tokenIdsData[i] || []
        if (tokenIds.length === 0) continue

        // Verify ownership with POSM
        const owners = await api.multiCall({
          abi: ownerOfAbi,
          calls: tokenIds.map(id => ({ target: UNISWAP_V4_POSM, params: [id] })),
          permitFailure: true,
        })

        // Filter valid tokenIds where pool is the owner
        const validTokenIds = tokenIds.filter((id, j) => owners[j] === pool)
        uniV4Ids.push(...validTokenIds)
      }

      const uniqueTokens = getUniqueAddresses(allTokens)
      sdk.log('chain: ', api.chain, 'pools: ', pools.length, 'tokens: ', uniqueTokens.length, 'valid uniV4 tokenIds: ', uniV4Ids.length, 'uniV4 pools: ', pools.filter((_, i) => tokenIdsData[i]?.length > 0).length, 'gmx pools: ', gmxPools.length)
      return { pools, tokens: uniqueTokens, uniV4Ids, gmxPools }
    }
  }
})

const poolData = {}