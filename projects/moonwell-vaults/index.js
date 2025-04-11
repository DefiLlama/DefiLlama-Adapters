const { getLogs2 } = require("../helper/cache/getLogs");
const { mergeExports } = require("../helper/utils");

const baseConfig = {
  morphoFactory: "0xA9c3D3a366466Fa809d1Ae982Fb2c46E5fC41101",
  governor: "0x8b621804a7637b781e2BbD58e256a591F2dF7d51",
  startBlock: 15620450,
}

const optimismConfig = {
  morphoFactory: "0x3Bb6A6A0Bc85b367EFE0A5bAc81c5E52C892839a",
  governor: "0x17C9ba3fDa7EC71CcfD75f978Ef31E21927aFF3d",
  startBlock: 131331972,
}

const MorphoVaultsTVL = (factoryAddess, governor, startBlock) => {

  return async (api) => {
    const allVaults = (
      await getLogs2({
        api,
        factory: factoryAddess,
        eventAbi:
          "event CreateMetaMorpho(address indexed metaMorpho, address indexed caller, address initialOwner, uint256 initialTimelock, address indexed asset, string name, string symbol, bytes32 salt)",
        fromBlock: startBlock,
      })
    ).map((log) => log.metaMorpho);

    const allVaultOwners = await api.multiCall({
      calls: allVaults,
      abi: "function owner() public view returns (address)",
    });

    const morphoVaults = allVaults.filter(
      (_, i) =>
        allVaultOwners[i].toLowerCase() ===
        governor.toLowerCase()
    );

    const underlyingAssets = await api.multiCall({
      calls: morphoVaults,
      abi: "function asset() public view returns (address)",
    });
    const totalAssets = await api.multiCall({
      calls: morphoVaults,
      abi: "function totalAssets() public view returns (uint256)",
    });

    underlyingAssets.forEach((asset, i) => {
      api.add(asset, totalAssets[i]);
    });

    return api.getBalances();
  }
};

module.exports = mergeExports([
  {
    doublecounted: true,
    base: { tvl: MorphoVaultsTVL(baseConfig.morphoFactory, baseConfig.governor, baseConfig.startBlock) },
  },
  {
    doublecounted: true,
    optimism: { tvl: MorphoVaultsTVL(optimismConfig.morphoFactory, optimismConfig.governor, optimismConfig.startBlock) },
  },
]);
