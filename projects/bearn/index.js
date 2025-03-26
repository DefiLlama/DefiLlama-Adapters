const { sumTokens2 } = require("../helper/unwrapLPs");

const vaultFactory = "0x70b14cd0Cf7BD442DABEf5Cb0247aA478B82fcbb";
const voter = "0x37d1E4594ed04818B68aF5396bc7388c26F17E4A";
const bgt = "0x656b95E550C07a9ffe548bd4085c72418Ceb1dba";

async function vaultsTVL(api) {
  // grab all the vaults
  const compoundingVaults = await api.call({
    abi: "function getAllCompoundingVaults() external view returns (address[])",
    target: vaultFactory,
  });
  const bgtEarnerVaults = await api.call({
    abi: "function getAllBgtEarnerVaults() external view returns (address[])",
    target: vaultFactory,
  });

  const vaults = [...compoundingVaults, ...bgtEarnerVaults];

  // grab all the tokens and balances in the vaults
  const tokens = await api.multiCall({
    abi: "address:stakingAsset",
    calls: vaults,
  });

  const balances = await api.multiCall({
    abi: "uint256:totalAssets",
    calls: vaults,
  });

  // grab BGT balance of yBGT backing
  const bgtBalance = await api.call({
    abi: "erc20:balanceOf",
    target: bgt,
    params: [voter],
  });

  tokens.push(bgt);
  balances.push(bgtBalance);

  api.add(tokens, balances);
  return sumTokens2({ api, resolveLP: true });
}

module.exports = {
  berachain: {
    methodology: "TVL is calculated from the balances of all Bearn Vaults plus the BGT that backs yBGT.",
    tvl: vaultsTVL,
  },
};
