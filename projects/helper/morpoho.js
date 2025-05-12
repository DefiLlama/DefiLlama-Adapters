const { getLogs2 } = require("./cache/getLogs");

const config = {
  base: {
    morphoFactory: "0xA9c3D3a366466Fa809d1Ae982Fb2c46E5fC41101",
    governor: "0x8b621804a7637b781e2BbD58e256a591F2dF7d51",
    startBlock: 15620450,
  },
  optimism: {
    morphoFactory: "0x3Bb6A6A0Bc85b367EFE0A5bAc81c5E52C892839a",
    governor: "0x17C9ba3fDa7EC71CcfD75f978Ef31E21927aFF3d",
    startBlock: 131331972,

  }
}

function getMorphoVaultTvl(governor, {
  morphoFactory,
  startBlock,
} = {}) {
  return async (api) => {
    morphoFactory = morphoFactory ?? config[api.chain].morphoFactory
    startBlock = startBlock ?? config[api.chain].startBlock

    if (!governor) {
      throw new Error("Morpho Vaults TVL requires a governor address");
    }
    if (!morphoFactory || !startBlock) {
      throw new Error("Morpho Vaults TVL requires a morphoFactory and startBlock");
    }

    governor = governor.toLowerCase();

    const allVaults = (
      await getLogs2({
        api,
        factory: morphoFactory,
        eventAbi:
          "event CreateMetaMorpho(address indexed metaMorpho, address indexed caller, address initialOwner, uint256 initialTimelock, address indexed asset, string name, string symbol, bytes32 salt)",
        fromBlock: startBlock,
      })
    ).map((log) => log.metaMorpho);
    const owners = await api.multiCall({ abi: 'address:owner', calls: allVaults })
    const morphoVaults = allVaults.filter((_, i) => owners[i].toLowerCase() === governor);
    return api.erc4626Sum({ calls: morphoVaults, isOG4626: true, })

  }

}


module.exports = {
  getMorphoVaultTvl
}
