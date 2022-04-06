const { calculateHodltreeBalancesEth, calculateHodltreeBalancesPolygon } = require("../helper/hodltree/calculateBalances");

module.exports = {
    methodology:
        "Only staked LP is counted as TVL. Excluded in TVL : Locked BEE in the RoyalJelly, NFT Jelly, value of BNB & xJOE which aren't on CoinGecko yet.",
    ethereum: {
        tvl: calculateHodltreeBalancesEth
    },
    polygon: {
        tvl: calculateHodltreeBalancesPolygon
    }
}; // node test.js projects/HoneyFarm/index.js
  