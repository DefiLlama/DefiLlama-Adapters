const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const v1TVL = require('./convexity');
const v2TVL = require('./gamma');
const squeethTVL = require('./squeeth');

async function ethTvl(_, block) { 

  const v1Balances = await v1TVL.tvl(_, block);
  const v2Balances = await v2TVL.tvl(_, block);
  const squeethBalances = await squeethTVL.tvl(_, block);

  function sumObjectsByKey(...objs) {
    return objs.reduce((a, b) => {
      for (let k in b) {
        if (b.hasOwnProperty(k))
          // a[k] = (a[k] || 0) + b[k];
          a[k] = BigNumber( a[k] || 0).plus(BigNumber(b[k])).toFixed();
      }
      return a;
    }, {});
  }

  const totBalances = sumObjectsByKey(v1Balances, v2Balances, squeethBalances);

  return totBalances

}



module.exports = {
  start: 1581542700,  // 02/12/2020 @ 09:25PM (UTC)
  tvl: sdk.util.sumChainTvls([ethTvl]),
  hallmarks: [
    [1619493707, "Ribbon launch"]
  ]
}
