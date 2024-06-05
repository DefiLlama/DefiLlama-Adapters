const { calculateHodltreeBalancesEth, calculateHodltreeBalancesPolygon } = require("../helper/hodltree/calculateBalances");

module.exports = {
    methodology:
        `Flashloan pools: sum of all available liquidity
         Lend-borrow contracts: sum of tokens provided as collateral and tokens provided by lenders
         Elastic-Modules: sum of tokens provided by hedgers and amount of tokens to hedge
        `,
            ethereum: {
        tvl: calculateHodltreeBalancesEth
    },
    polygon: {
        tvl: calculateHodltreeBalancesPolygon
    }
};
  