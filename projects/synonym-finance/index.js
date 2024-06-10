
const hub = '0x1e3f1f1cA8C62aABCB3B78D87223E988Dfa3780E'
async function tvl(api) {
  const { tokens, tokenMappings } = await getTokenInfos(api)
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map(token => ({ target: token, params: hub })) })
  api.add(tokenMappings, bals, { skipChain: true })
  return api.getBalances()
}

async function borrowed(api) {
  const { tokens, tokenMappings } = await getTokenInfos(api)
  const bals = (await api.multiCall({ abi: "function getGlobalAmounts(address assetAddress) view returns ((uint256 deposited, uint256 borrowed))", calls: tokens, target: hub })).map(i => i.borrowed)
  api.add(tokenMappings, bals, { skipChain: true })
  return api.getBalances()
}

module.exports = {
  arbitrum: { tvl, borrowed, },
}

async function getTokenInfos(api) {
  const registry = await api.call({ abi: 'address:getAssetRegistry', target: hub })
  const tokenBridge = await api.call({ abi: 'address:tokenBridge', target: hub })
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
  const natives = await api.multiCall({ abi: 'function nativeContract() view returns (bytes32)', calls: bridgedAssets })
  const chainId = await api.multiCall({ abi: 'function chainId() view returns (uint16)', calls: bridgedAssets })
  const tokens = arbiAssets
  const tokenMappings = arbiAssets.map(asset => 'arbitrum:' + asset)
  bridgedAssets.forEach((asset, i) => {
    let chain;
    switch (chainId[i]) {
      case '2': chain = 'ethereum'; break;
      case '24': chain = 'optimism'; break;
      case '30': chain = 'base'; break;
      case '34': chain = 'scroll'; break;
      default: console.log('Unsupported chain ' + chainId[i] + "0x" + BigInt(natives[i]).toString(16)); return;
    }
    tokenMappings.push(chain + ':' + "0x" + BigInt(natives[i]).toString(16))
    tokens.push(asset)
  })

  return { tokens, tokenMappings }

}