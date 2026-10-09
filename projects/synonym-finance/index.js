const sdk = require("@defillama/sdk");

// Synonym hub on arbitrum. Assets are registered by id (bytes32) with one token address per
// wormhole chain; spoke deposits are tracked on the hub via getSpokeBalances, hub-chain (arbitrum)
// deposits sit in the hub contract itself, and borrows are global (reported on the hub chain).
const hub = '0x1e3f1f1cA8C62aABCB3B78D87223E988Dfa3780E'
const bytes32ToAddress = (b) => "0x" + b.slice(-40);
const isZero = (b) => /^0x0*$/.test(b)

const wormholeChainIds = {
  arbitrum: 23,
  ethereum: 2,
  optimism: 24,
  base: 30,
  scroll: 34,
}

const abis = {
  getRegisteredAssets: 'function getRegisteredAssets() view returns (bytes32[])',
  getAssetAddress: 'function getAssetAddress(bytes32 id, uint16 chainId) view returns (bytes32)',
  getSpokeBalances: 'function getSpokeBalances(uint16 chainId, bytes32 tokenHomeAddress) view returns ((uint256 finalized, uint256 unfinalized))',
  getGlobalAmounts: 'function getGlobalAmounts(bytes32 assetId) view returns ((uint256 deposited, uint256 borrowed))',
}

async function getChainAssets(api) {
  const hubApi = new sdk.ChainApi({ chain: 'arbitrum', timestamp: api.timestamp })
  const wormholeId = wormholeChainIds[api.chain]
  const registry = await hubApi.call({ abi: 'address:getAssetRegistry', target: hub })
  const ids = await hubApi.call({ abi: abis.getRegisteredAssets, target: registry })
  const addresses = await hubApi.multiCall({ abi: abis.getAssetAddress, target: registry, calls: ids.map(id => ({ params: [id, wormholeId] })), permitFailure: true })
  const assets = []
  ids.forEach((id, i) => {
    if (!addresses[i] || isZero(addresses[i])) return
    assets.push({ id, token: bytes32ToAddress(addresses[i]), tokenBytes32: addresses[i] })
  })
  return { hubApi, wormholeId, assets }
}

async function tvl(api) {
  const { hubApi, wormholeId, assets } = await getChainAssets(api)
  if (api.chain === 'arbitrum') {
    // hub chain: deposits are held by the hub contract directly
    const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: assets.map(a => ({ target: a.token, params: hub })) })
    api.add(assets.map(a => a.token), bals)
    return
  }
  const spoke = await hubApi.multiCall({ abi: abis.getSpokeBalances, target: hub, calls: assets.map(a => ({ params: [wormholeId, a.tokenBytes32] })) })
  spoke.forEach(({ finalized, unfinalized }, i) => api.add(assets[i].token, +finalized + +unfinalized))
}

// borrows are accounted globally on the hub, so they are reported once on the hub chain
async function borrowed(api) {
  if (api.chain !== 'arbitrum') return
  const { hubApi, assets } = await getChainAssets(api)
  const globals = await hubApi.multiCall({ abi: abis.getGlobalAmounts, target: hub, calls: assets.map(a => a.id) })
  globals.forEach(({ borrowed }, i) => api.add(assets[i].token, borrowed))
}

module.exports = {
  methodology: 'Deposits per chain are read from the Synonym hub (spoke balances for L2s/mainnet, hub token balances on arbitrum); borrows are global and reported on arbitrum.',
}

Object.keys(wormholeChainIds).forEach(chain => {
  module.exports[chain] = { tvl, borrowed }
})
