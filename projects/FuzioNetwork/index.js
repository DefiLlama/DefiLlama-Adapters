const { queryContracts, getDenomBalance } = require("../helper/chain/cosmos");
const { transformDexBalances } = require("../helper/portedTokens");

const POOL_CONTRACT_CODE_ID = 86;

module.exports = {
  timetravel: false,
  methodology: "Liquidity on the DEX",
  sei: {
    tvl: async (_, _1, _2, { chain }) => {
      const contracts = await queryContracts({ chain, codeId: POOL_CONTRACT_CODE_ID })

      let totalBalance = 0;

      for (const contract of contracts) {
        const balance = await getDenomBalance({
          chain,
          owner: contract,
          denom: "usei",
        });

        totalBalance += balance;
      }




      const data = [
        {
          token0: 'usei',
          token0Bal: totalBalance,
          token1: 'uusd',
          token1Bal: 0
        },
      ]
      return transformDexBalances({ chain, data });
    },
  },
};