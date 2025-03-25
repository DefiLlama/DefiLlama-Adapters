const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");

const { sumTokens2 } = require("../helper/unwrapLPs");

const vaultFactory = "0x70b14cd0Cf7BD442DABEf5Cb0247aA478B82fcbb";
const yBGT = "0x7e768f47dfDD5DAe874Aac233f1Bc5817137E453";

async function vaultsTVL(api) {
  const compoundingVaults = await api.call({
    // abi: "function getAllCompoundingVaults() external view returns (address[] vaults)",
    abi: "function getAllCompoundingVaults() external view returns (address[])",
    target: vaultFactory,
  });
  const bgtEarnerVaults = await api.call({
    abi: "function getAllBgtEarnerVaults() external view returns (address[])",
    target: vaultFactory,
  });

  const vaults = [...compoundingVaults, ...bgtEarnerVaults];

  const tokens = await api.multiCall({
    abi: "address:stakingAsset",
    calls: vaults,
  });

  const balances = await api.multiCall({
    abi: "uint256:totalAssets",
    calls: vaults,
  });

  api.add(tokens, balances);
  return sumTokens2({ api, resolveLP: true });
}

module.exports = {
  berachain: {
    tvl: vaultsTVL,
  },
};
