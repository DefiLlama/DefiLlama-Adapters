const { api } = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  methodology:
    "TVL counts the collateral tokens that are deposited within the respective Stack vault, as well as the amount of staked MORE.",
};

const config = {
  real: {
    smore: "0xD1e39288520f9f3619714B525e1fD5F8c023dbA1",
    vaultFactory: "0x303C5d72D2d123ac6C36957d167Ca7Cfee3414e7",
  },
};

Object.keys(config).forEach((chain) => {
  const { smore, vaultFactory } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const numVaults = await api.call({
        abi: "uint:allVaultsLength",
        target: vaultFactory,
      });
      const vaults = await api.multiCall({
        abi: "function allVaults(uint256) view returns (address)",
        target: vaultFactory,
        calls: [...new Array(Number(numVaults)).keys()],
      });
      const tokens = await api.multiCall({
        abi: "address:collateralToken",
        calls: vaults,
      });
      const more = await api.call({
        abi: "address:asset",
        target: smore,
      });
      const tokensAndOwners = [
        ...tokens.map((t, i) => [t, vaults[i]]),
        [more, smore],
      ];
      return sumTokens2({ tokensAndOwners, api });
    },
  };
});
