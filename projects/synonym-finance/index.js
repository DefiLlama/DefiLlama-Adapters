const sdk = require("@defillama/sdk");
const bytes32ToAddress = (bytes32Address) => "0x" + bytes32Address.substr(-40);

const hub = '0x1e3f1f1cA8C62aABCB3B78D87223E988Dfa3780E'
async function tvl({timestamp, chain}) {
  const api = new sdk.ChainApi({ timestamp, chain: 'arbitrum' })
  const { tokens, tokenMappings } = await getTokenInfos(api, chain)
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map(token => ({ target: token, params: hub })) })
  api.add(tokenMappings, bals, { skipChain: true })
  return api.getBalances()
}

async function borrowed({timestamp, chain }) {
  const api = new sdk.ChainApi({ timestamp, chain: 'arbitrum' })
  const { tokens, tokenMappings } = await getTokenInfos(api, chain)
  const bals = (await api.multiCall({ abi: "function getGlobalAmounts(address assetAddress) view returns ((uint256 deposited, uint256 borrowed))", calls: tokens, target: hub })).map(i => i.borrowed)
  api.add(tokenMappings, bals, { skipChain: true })
  return api.getBalances()
}

const chains = [
    'arbitrum',
    'ethereum',
    'optimism',
    'base',
    'scroll',
]

chains.forEach(chain => {
  module.exports[chain] = {
    tvl,
    borrowed
  }
})

async function getTokenInfos(api, requestedChain) {
  const registry = await api.call({ abi: 'address:getAssetRegistry', target: hub })
  const wormholeTunnel = await api.call({ abi: 'address:getWormholeTunnel', target: hub })
  const tokenBridge = await api.call({ abi: 'address:tokenBridge', target: wormholeTunnel })
  const assets = await api.call({ abi: 'address[]:getRegisteredAssets', target: registry })
  const isBridged = await api.multiCall({ abi: 'function isWrappedAsset(address) view returns (bool)', calls: assets, target: tokenBridge })
  const arbiAssets = []
  const bridgedAssets = []
  assets.forEach((asset, i) => {
    if (isBridged[i])
      bridgedAssets.push(asset)
    else
      arbiAssets.push(asset)
  })

  if (requestedChain === 'arbitrum') {
    return { tokens: arbiAssets, tokenMappings: arbiAssets.map(asset => 'arbitrum:' + asset) }
  }

  const natives = await api.multiCall({ abi: 'function nativeContract() view returns (bytes32)', calls: bridgedAssets })
  const chainId = await api.multiCall({ abi: 'function chainId() view returns (uint16)', calls: bridgedAssets })

  const tokens = []
  const tokenMappings = []

  bridgedAssets.forEach((asset, i) => {
    let chain;
    switch (chainId[i]) {
      case '2': chain = 'ethereum'; break;
      case '24': chain = 'optimism'; break;
      case '30': chain = 'base'; break;
      case '34': chain = 'scroll'; break;
      default: console.log('Unsupported chain ' + chainId[i] + bytes32ToAddress(natives[i])); return;
    }

    if (chain === requestedChain) {
      tokens.push(asset)
      tokenMappings.push(chain + ':' + bytes32ToAddress(natives[i]))
    }
  })

  return { tokens, tokenMappings }

}