const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')

const vaultABI = {
  "getUnderlyings": "function getUnderlyings() external view returns (address[])",
  "assetsBorrowed": "function assetsBorrowed() external view returns (uint256)"
}

const ETHVault = '0x8f88aE3798E8fF3D0e0DE7465A0863C9bbB577f0';
const BTCVault = '0xf401Cc9f467c7046796D9A8b44b0c1348b4DEec7';

const ethTvl = async (api) => {
  const usedTVL = await api.call({ abi: vaultABI.assetsBorrowed, target: ETHVault })
  api.add(ADDRESSES.ethereum.WETH, usedTVL);

  const underlyings = await api.call({ abi: vaultABI.getUnderlyings, target: ETHVault })
  return api.sumTokens({ owner: ETHVault, tokens: underlyings })
}

const btcTvl = async (api) => {
  const underlyings = await api.call({ abi: vaultABI.getUnderlyings, target: BTCVault })
  return api.sumTokens({ owner: BTCVault, tokens: underlyings })
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: sdk.util.sumChainTvls([ethTvl, btcTvl]),
  }
}