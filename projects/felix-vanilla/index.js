const morphoBlueAdapter = require("../morpho-blue/index.js");
const { getLogs2 } = require("../helper/cache/getLogs");

const morphoFactory = "0xec051b19d654c48c357dc974376deb6272f24e53";
const governor = "0x4A827418D632C415E19825fd011283A4ba020B3A";
const startBlock = 1988677;

const tvl = async (api) => {
  await morphoBlueAdapter.hyperliquid.tvl(api);

  const logs = await getLogs2({
    api,
    factory: morphoFactory,
    eventAbi:
      "event CreateMetaMorpho(address indexed metaMorpho, address indexed caller, address initialOwner, uint256 initialTimelock, address indexed asset, string name, string symbol, bytes32 salt)",
    fromBlock: startBlock,
  });
  const allVaults = logs.map((log) => log.metaMorpho);
  const owners = await api.multiCall({ abi: "address:owner", calls: allVaults });
  const felixVaultAddresses = allVaults.filter((_, i) => owners[i] && owners[i].toLowerCase() === governor.toLowerCase());

  const assets = await api.multiCall({
    abi: "function asset() view returns (address)",
    calls: felixVaultAddresses,
  });

  const totalAssets = await api.multiCall({
    abi: "function totalAssets() view returns (uint256)",
    calls: felixVaultAddresses,
  });

  assets.forEach((asset, i) => {
    if (asset && totalAssets[i]) {
      api.add(asset, totalAssets[i] * -1);
    }
  });
};

module.exports = {
  methodology:
    "Felix Vanilla represents direct lending markets TVL calculated as Total Morpho Blue TVL minus Felix Vaults TVL. This captures the portion of Morpho Blue markets accessed through Felix's direct lending interface rather than through managed vaults.",
  doublecounted: true,
  hyperliquid: {
    tvl,
  },
};
