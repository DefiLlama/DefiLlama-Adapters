const { sumTokens2 } = require('../helper/unwrapLPs')

// Docs: https://docs.elara.fi/risk-and-security/deployed-addresses
// NAVAggregator registers the treasury wallets, the plain tokens they hold, and one "reader" adapter
// per position type. Instead of trusting the readers' USD output we enumerate the underlying
// positions from each reader and price them ourselves.
const NAV_AGGREGATOR = '0x507f997c64dE57e189ed1ce95b832CE7b65FAc50'
const UNIV4_POSM = '0xbD216513d74C8cf14cf4747E6AaA6420FF64ee9e'

const abi = {
  getToken: 'function getToken(uint256 index) view returns (address)',
  getWallet: 'function getWallet(uint256 index) view returns (address)',
  getAdapter: 'function getAdapter(uint256 index) view returns (address)',
  getMarket: 'function getMarket(uint256 index) view returns (address)',
  readTokens: 'function readTokens() view returns (address _SY, address _PT, address _YT)',
  positionCount: 'function positionCount(address wallet) view returns (uint256)',
  // (PoolKey key, int24 tickLower, int24 tickUpper, uint256 tokenId, uint8, uint8)
  getPosition: 'function getPosition(address wallet, uint256 index) view returns (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks, int24 tickLower, int24 tickUpper, uint256 tokenId, uint8, uint8)',
}

const tvl = async (api) => {
  const tokens = await api.fetchList({ target: NAV_AGGREGATOR, lengthAbi: 'uint256:tokenCount', itemAbi: abi.getToken })
  const wallets = await api.fetchList({ target: NAV_AGGREGATOR, lengthAbi: 'uint256:walletCount', itemAbi: abi.getWallet })
  const adapters = await api.fetchList({ target: NAV_AGGREGATOR, lengthAbi: 'uint256:adapterCount', itemAbi: abi.getAdapter })
  const labels = await api.multiCall({ abi: 'string:label', calls: adapters })

  const uniV4PositionIds = []

  for (let i = 0; i < adapters.length; i++) {
    const adapter = adapters[i]
    switch (labels[i]) {
      case 'Pendle Reader': {
        // wallets hold PT / YT / LP of the registered Pendle markets
        const markets = await api.fetchList({ target: adapter, lengthAbi: 'uint256:marketCount', itemAbi: abi.getMarket })
        const marketTokens = await api.multiCall({ abi: abi.readTokens, calls: markets })
        tokens.push(...markets)
        marketTokens.forEach(({ _PT, _YT }) => tokens.push(_PT, _YT))
        break
      }
      case 'Uniswap V4 Reader': {
        const counts = await api.multiCall({ abi: abi.positionCount, target: adapter, calls: wallets })
        const calls = []
        wallets.forEach((wallet, j) => { for (let k = 0; k < +counts[j]; k++) calls.push({ params: [wallet, k] }) })
        const positions = await api.multiCall({ abi: abi.getPosition, target: adapter, calls })
        positions.forEach(p => uniV4PositionIds.push(p.tokenId))
        break
      }
      case 'Ethena sUSDe': {
        tokens.push(await api.call({ target: adapter, abi: 'address:vault' }))
        break
      }
      default:
        throw new Error(`elara-finance: unknown NAV adapter ${adapter} (${labels[i]}), add support for it`)
    }
  }

  await api.sumTokens({ tokens, owners: wallets })

  if (uniV4PositionIds.length)
    await sumTokens2({ api, owner: UNIV4_POSM, resolveUniV4: true, uniV4ExtraConfig: { positionIds: uniV4PositionIds } })
}

module.exports = {
  methodology: 'TVL is the sum of the registered tokens & positions held by the registered treasury wallets',
  start: '2026-06-16',
  ethereum: { tvl },
}
