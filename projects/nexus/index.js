const { sumTokens2 } = require('../helper/unwrapLPs');

const pools = [
  '0xcafeaBED7e0653aFe9674A3ad862b78DB3F36e60'   // current pool
];
const yieldPools = [
  '0x27f23c710dd3d878fe9393d93465fed1302f2ebd'
]
const getAssetsABI = "function getAssets() view returns (tuple(address assetAddress, bool isCoverAsset, bool isAbandoned)[])"

async function tvl(api) {
  const assets = await api.multiCall({ abi: getAssetsABI, calls: pools})
  const ownerTokens = assets.map((v, i) => [v.map(i => i.assetAddress), pools[i]])
  const assets2 = await api.multiCall({  abi: 'address[]:getTrackedAssets', calls: yieldPools }) 
  assets2.forEach((v, i) => ownerTokens.push([v, yieldPools[i]]))
  return sumTokens2({ api, ownerTokens, blacklistedTokens: yieldPools})
}

module.exports = {
  start: 1558569600, // 05/23/2019 @ 12:00am (UTC)
  ethereum: { tvl }
}
