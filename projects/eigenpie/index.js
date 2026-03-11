const ADDRESSES = require('../helper/coreAssets.json')

const CONFIG = {
  ethereum: {
    eigenConfig: "0x20b70E4A1883b81429533FeD944d7957121c7CAB",
    eigenStaking: "0x24db6717dB1C75B9Db6eA47164D8730B63875dB7",
    eigenBuffer: "0x98083e22d12497c1516d3c49e7cc6cd2cd9dcba4",
    egETH: "0x18f313fc6afc9b5fd6f0908c1b3d476e3fea1dd9",
    ethereum: ADDRESSES.null
  },
}

const abis = {
  getSupportedAssetList: 'address[]:getSupportedAssetList',
  mLRTReceiptByAsset: "function mLRTReceiptByAsset(address token) view returns (address)",
  getAssetDistributionData: "function getAssetDistributionData(address asset) view returns (uint256 assetLyingInDepositPool, uint256 assetLyingInNDCs, uint256 assetStakedInEigenLayer, uint256 assetLyingInEWD)",
}

const tvl = async (api) => {
  const { eigenConfig, eigenStaking, eigenBuffer, ethereum } = CONFIG[api.chain]
  const getSupportedAssetLists = await api.call({ abi: abis.getSupportedAssetList, target: eigenConfig })
  const assetsDistributions = await api.multiCall({ target: eigenStaking, calls: getSupportedAssetLists, abi: abis.getAssetDistributionData })
  await api.sumTokens({ owner: eigenBuffer, tokens: getSupportedAssetLists.map(t => t.toLowerCase() === '0xefefefefefefefefefefefefefefefefefefefef' ? ethereum : t) })
  assetsDistributions.forEach(({ assetLyingInDepositPool, assetStakedInEigenLayer, assetLyingInNDCs, assetLyingInEWD }, i) => {
    const token = getSupportedAssetLists[i]
    api.add(token, assetLyingInDepositPool)
    api.add(token, assetStakedInEigenLayer)
    api.add(token, assetLyingInNDCs)
    api.add(token, assetLyingInEWD)
  })
}

module.exports = {
  doublecounted: true,
  ethereum: { tvl },
  zircuit: { tvl: () => ({  }) }
}
