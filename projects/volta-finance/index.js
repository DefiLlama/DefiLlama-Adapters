const { sumTokens2 } = require('../helper/unwrapLPs')
const vaults = [
  '0xb4ff7E61F825A5B80E20F6070fCC959Ea136Ed88'
]

const erc4626 = [
  '0x39ff5098081FBE1ab241c31Fe0a9974FE9891d04', // voltGNS
]

async function tvl(api) {
  const collaterals = await api.multiCall({ abi: 'address:collateral', calls: vaults})
  const assets = await api.multiCall({ abi: 'address:asset', calls: erc4626})
  const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: erc4626})
  api.addTokens(assets, bals)
  return sumTokens2({ api, tokensAndOwners2: [collaterals, vaults]})
}

module.exports = {
  doublecounted: true,
  methodology: "counts the tokens used as collateral in vaults for VOLT stablecoin loans",
  arbitrum: { tvl, }
};