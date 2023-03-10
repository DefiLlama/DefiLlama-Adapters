const { sumTokens3 } = require('../helper/unwrapLPs');

const pools = [
  '0xcafea112Db32436c2390F5EC988f3aDB96870627',   // current pool
  '0x27F23c710dD3d878FE9393d93465FeD1302f2EbD',  // Nexus Mutual Enzyme vault
];
const getAssetsABI = "function getAssets() view returns (tuple(address assetAddress, bool isCoverAsset, bool isAbandoned)[])"

async function tvl(timestamp, block, _, { api }) {
  const assets = await api.multiCall({ abi: getAssetsABI, calls: pools})
  return sumTokens2({ api, ownerTokens: assets.map((v, i) => [v.map(i => i.assetAddress), pools[i]])})
}

module.exports = {
  start: 1558569600, // 05/23/2019 @ 12:00am (UTC)
  ethereum: { tvl }
}
