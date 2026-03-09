const abi = {
    "getSupportedAsset": "function getSupportedAsset(uint256 assetId) view returns (address)",
    "getSupportedAssets": "address[]:getSupportedAssets",
    "getSupportedAssetsLength": "uint256:getSupportedAssetsLength",
    "getTotalDeposited": "uint256[]:getTotalDeposited",
    "getTotalFees": "uint256[]:getTotalFees",
    "getTotalPendingDeposit": "uint256[]:getTotalPendingDeposit",
    "getTotalWithdrawn": "uint256[]:getTotalWithdrawn"
  };
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { eulerTokens } = require('../helper/tokenMapping')

const aztecRollupProcessor = '0x737901bea3eeb88459df9ef1BE8fF3Ae1B42A2ba'
const aztecConnect = '0xFF1F2B4ADb9dF6FC8eAFecDcbF96A2B351680455'

async function tvl(api) {
  // Get aztec supported assets
  const supportedAssets = await api.call({ target: aztecRollupProcessor, abi: abi['getSupportedAssets'], })
  const tokensAndOwners = ([nullAddress, ...supportedAssets]).map(i => ([i, aztecRollupProcessor]))
  const supportedAssetsConnect = await api.fetchList({ target: aztecConnect, lengthAbi: abi.getSupportedAssetsLength, itemAbi: abi.getSupportedAsset, })
  tokensAndOwners.push([nullAddress, aztecConnect])
  supportedAssetsConnect.map(i => tokensAndOwners.push([i, aztecConnect]))
  return sumTokens2({ tokensAndOwners, api, blacklistedTokens: eulerTokens, })
}

module.exports = {
  hallmarks: [
    ['2023-03-13', 'Euler was hacked'],
    ['2023-03-13', 'AztecConnect sunset announced'],
  ],
  methodology: "TVL of Aztec consists of ethereum and supported assets locked into the rollup processor",
  ethereum: {
    tvl,
  }
}
