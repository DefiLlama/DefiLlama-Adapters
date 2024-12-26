const ADDRESSES = require('../helper/coreAssets.json')

const vaultABI = {
  "getUnderlyings": "function getUnderlyings() external view returns (address[])",
  "assetsBorrowed": "function assetsBorrowed() external view returns (uint256)"
}

const Vault = '0x8f88aE3798E8fF3D0e0DE7465A0863C9bbB577f0';

const Tvl = async (api) => {
  const usedTVL = await api.call({ abi: vaultABI.assetsBorrowed, target: Vault })
  api.add(ADDRESSES.ethereum.WETH, usedTVL);

  const underlyings = await api.call({ abi: vaultABI.getUnderlyings, target: Vault })
  return api.sumTokens({ owner: Vault, tokens: underlyings })
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: Tvl,
  }
}
