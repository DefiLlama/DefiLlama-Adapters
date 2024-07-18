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
  const MasterProxy = '0x01BFd82675DBCc7762C84019cA518e701C0cD07e'
  // const bytes2 = ethers.utils.formatBytes32String('P1').slice(0, 4) // '0x5031
  const P1Address = await api.call({ abi: 'function getLatestAddress(bytes2) view returns (address)', target: MasterProxy, params: '0x5031' })
  const ethValue = await api.call({  abi: 'uint256:getPoolValueInEth', target: P1Address})
  api.addGasToken(ethValue)
  return sumTokens2({ api, ownerTokens, blacklistedTokens: yieldPools})
}

module.exports = {
  start: 1558569600, // 05/23/2019 @ 12:00am (UTC)
  ethereum: { tvl }
}
