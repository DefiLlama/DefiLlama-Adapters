const ADDRESSES = require('../helper/coreAssets.json')

const vaultABI = {
  "getUnderlyings": "function getUnderlyings() external view returns (address[])",
  "assetsBorrowed": "function assetsBorrowed() external view returns (uint256)"
}

const ETHVault = '0x8f88aE3798E8fF3D0e0DE7465A0863C9bbB577f0';
const BTCVault = '0xf401Cc9f467c7046796D9A8b44b0c1348b4DEec7';

const tvl = async (api) => {
  // to include assets moved to boyco vault
  const usedTVL = await api.call({ abi: vaultABI.assetsBorrowed, target: ETHVault })
  api.add(ADDRESSES.ethereum.STONE, usedTVL);

  const vaults = [ETHVault, BTCVault];
  const tokens = await api.multiCall({  abi: vaultABI.getUnderlyings, calls: vaults})
  return api.sumTokens({ ownerTokens: tokens.map((t, i) => [t, vaults[i]]) })
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  }
}