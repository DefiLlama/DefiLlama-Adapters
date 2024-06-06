const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const RISK_OFF_USD_VAULT = "0x30D120f80D60E7b58CA9fFaf1aaB1815f000B7c3"
const RISK_OFF_ETH_VAULT = "0x8f0Cb368C63fbEDF7a90E43fE50F7eb8B9411746"

async function tvl(api) {
  const assets = await api.multiCall({  abi: 'uint256:totalAssets', calls: [RISK_OFF_USD_VAULT]})
  api.add(ADDRESSES.ethereum.USDT, assets[0] / 1e12)
  const tokens = await api.call({  abi: 'address[]:getTrackedAssets', target: RISK_OFF_ETH_VAULT})
  return sumTokens2({ tokens, owner: RISK_OFF_ETH_VAULT, api, })
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  }
}
