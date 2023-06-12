const ABI = require("../pawnfi/helper/abi.json")
const sdk = require("@defillama/sdk");
const { ApeStakingPoolAddress } = require("../pawnfi/helper/config.js")

module.exports = {
  ethereum: {
    tvl: async (_, _b, _cb, { api }) => {
      const balances = {};

      const stakedTotal = await api.multiCall({
        calls: [
          ApeStakingPoolAddress.BoundApe,
          ApeStakingPoolAddress.BoundBAYC,
          ApeStakingPoolAddress.BoundMAYC,
          ApeStakingPoolAddress.BoundBAKC,
        ],
        target: ApeStakingPoolAddress.ApeCoinStaking,
        abi: ABI.stakedTotal,
      })
      stakedTotal.forEach((d) =>
        sdk.util.sumSingleBalance(balances, ApeStakingPoolAddress.APE, d, api.chain)
      );
      return balances;
    },
  },
};
