const sdk = require('@defillama/sdk')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getUniqueAddresses } = require('../helper/tokenMapping')
const { getChainTransform } = require('../helper/portedTokens')

const activeTokensAbi = 'function getActiveTokens() view returns ((address[] activeTokens, address baseToken))'
const tokenIdsAbi = 'function getUniV4TokenIds() view returns (uint256[])'
const ownerOfAbi = 'function ownerOf(uint256 tokenId) view returns (address)'

const REGISTRY = '0x06767e8090bA5c4Eca89ED00C3A719909D503ED6' // same on all chains

module.exports = {
  methodology: `RigoBlock TVL on Ethereum, Arbitrum, Optimism, BSC, Base, and Unichain pulled from onchain data, including Uniswap V4 liquidity position balances (excluding GRG balances). Staking TVL includes staked GRG, plus GRG balances in Uniswap V4 liquidity positions, and GRG balances held by smart pool contracts.`,
}

const config = {
  ethereum: {
    fromBlock: 15817831,
    GRG_VAULT_ADDRESSES: '0xfbd2588b170Ff776eBb1aBbB58C0fbE3ffFe1931',
    GRG_TOKEN_ADDRESSES: '0x4FbB350052Bca5417566f188eB2EBCE5b19BC964',
    UNISWAP_V4_POSM: '0xbD216513d74C8cf14cf4747E6AaA6420FF64ee9e',
    UNISWAP_V4_STATE_VIEWER: '0x7fFE42C4a5DEeA5b0feC41C94C136Cf115597227',
  },
  arbitrum: {
    fromBlock: 32290603,
    GRG_VAULT_ADDRESSES: '0xE86a667F239A2531C9d398E81154ba125030497e',
    GRG_TOKEN_ADDRESSES: '0x7F4638A58C0615037deCc86f1daE60E55fE92874',
    UNISWAP_V4_POSM: '0xd88F38F930b7952f2DB2432Cb002E7abbF3dD869',
    UNISWAP_V4_STATE_VIEWER: '0x76Fd297e2D437cd7f76d50F01AfE6160f86e9990',
  },
  optimism: {
    fromBlock: 31239008,
    GRG_VAULT_ADDRESSES: '0x5932C223186F7856e08A1D7b35ACc2Aa5fC57BfD',
    GRG_TOKEN_ADDRESSES: '0xEcF46257ed31c329F204Eb43E254C609dee143B3',
    UNISWAP_V4_POSM: '0x3C3Ea4B57a46241e54610e5f022E5c45859A1017',
    UNISWAP_V4_STATE_VIEWER: '0xc18a3169788F4F75A170290584ECA6395C75Ecdb',
  },
  bsc: {
    fromBlock: 25550259,
    GRG_VAULT_ADDRESSES: '0x5494B4193961a467039B92CCfE0138Fe353240d6',
    GRG_TOKEN_ADDRESSES: '0x3d473C3eF4Cd4C909b020f48477a2EE2617A8e3C',
    UNISWAP_V4_POSM: '0x7A4a5c919aE2541AeD11041A1AEeE68f1287f95b',
    UNISWAP_V4_STATE_VIEWER: '0xd13Dd3D6E93f276FAfc9Db9E6BB47C1180aeE0c4',
  },
  base: {
    fromBlock: 2568188,
    GRG_VAULT_ADDRESSES: '0x7a7fa66B97a9e009ecAB4bCD62e87b2c0b65F21D',
    GRG_TOKEN_ADDRESSES: '0x09188484e1Ab980DAeF53a9755241D759C5B7d60',
    UNISWAP_V4_POSM: '0x7C5f5A4bBd8fD63184577525326123B519429bDc',
    UNISWAP_V4_STATE_VIEWER: '0xA3c0c9b65baD0b08107Aa264b0f3dB444b867A71',
  },
  unichain: {
    fromBlock: 16121670,
    GRG_VAULT_ADDRESSES: '0x448366d7C2e0af67D3723De875b7eAf548474A37',
    GRG_TOKEN_ADDRESSES: '0x03C2868c6D7fD27575426f395EE081498B1120dd',
    UNISWAP_V4_POSM: '0x4529A01c7A0410167c5740C487A8DE60232617bf',
    UNISWAP_V4_STATE_VIEWER: '0x86e8631A016F9068C3f085fAF484Ee3F5fDee8f2',
  },
}

Object.keys(config).forEach(chain => {
  const { fromBlock, GRG_TOKEN_ADDRESSES, GRG_VAULT_ADDRESSES, UNISWAP_V4_POSM, UNISWAP_V4_STATE_VIEWER } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const transformAddress = await getChainTransform(chain)
      const { pools, tokens, uniV4Ids } = await getPoolInfo(api)
      return sumTokens2({
        owners: pools,
        tokens,
        api,
        blacklistedTokens: [GRG_TOKEN_ADDRESSES],
        transformAddress,
        resolveUniV4: true,
        uniV4ExtraConfig: { positionIds: uniV4Ids, nftAddress: UNISWAP_V4_POSM, stateViewer: UNISWAP_V4_STATE_VIEWER }
      })
    },
    staking: async (api) => {
      const transformAddress = await getChainTransform(chain)
      const { pools, uniV4Ids } = await getPoolInfo(api)
      // Add GRG balances from vaults
      const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: pools, target: GRG_VAULT_ADDRESSES })
      bals.forEach(i => api.add(GRG_TOKEN_ADDRESSES, i))
      // Aggregate GRG from vaults, ERC20 pool balances, and Uniswap V4 positions in a single call
      return sumTokens2({
        owners: pools,
        tokens: [GRG_TOKEN_ADDRESSES], // Includes GRG ERC20 balances held by pools
        api,
        uniV3WhitelistedTokens: [GRG_TOKEN_ADDRESSES], // Includes GRG from Uniswap V4 positions
        transformAddress,
        resolveUniV4: true,
        uniV4ExtraConfig: { positionIds: uniV4Ids, nftAddress: UNISWAP_V4_POSM, stateViewer: UNISWAP_V4_STATE_VIEWER }
      })
    },
  }

  async function getPoolInfo(api) {
    const poolKey = `${api.chain}-${api.block}`
    if (!poolData[poolKey]) poolData[poolKey] = _getPoolInfo()
    return poolData[poolKey]

    async function _getPoolInfo() {
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

      // Fetch Uniswap V4 position tokenIds for all pools
      const tokenIdsData = await api.multiCall({
        abi: tokenIdsAbi,
        calls: pools,
        permitFailure: true, // Allow pools without tokenIds
      })

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
      sdk.log('chain: ', api.chain, 'pools: ', pools.length, 'tokens: ', uniqueTokens.length, 'valid uniV4 tokenIds: ', uniV4Ids.length, 'uniV4 pools: ', pools.filter((_, i) => tokenIdsData[i]?.length > 0).length)
      return { pools, tokens: uniqueTokens, uniV4Ids }
    }
  }
})

const poolData = {}