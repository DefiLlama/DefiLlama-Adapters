const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const v1TVL = require('./convexity');
const v2TVL = require('./gamma');
const v2AvaxTVL = require('./gamma_avax');
const squeethTVL = require('./squeeth');

async function ethTvl(_, block) { 

  const v1Balances = await v1TVL.tvl(_, block);
  const v2Balances = await v2TVL.tvl(_, block);
  const squeethBalances = await squeethTVL.tvl(_, block);

  function sumObjectsByKey(...objs) {
    return objs.reduce((a, b) => {
      for (let k in b) {
        if (b.hasOwnProperty(k))
          a[k] = BigNumber( a[k] || 0).plus(BigNumber(b[k])).toFixed();
      }
      return a;
    }, {});
  }

  const totBalances = sumObjectsByKey(v1Balances, v2Balances, squeethBalances);

  return totBalances

}

async function avaxTvl(_, block) {
  const avaxBalances = await v2AvaxTVL.tvl(_, block);
  return avaxBalances;
}

module.exports = {
  ethereum: {
    tvl: ethTvl
  },
  avalanche: {
    tvl: avaxTvl
  },
  tvl: sdk.util.sumChainTvls([ethTvl, avaxTvl]),
  hallmarks: [
    [1619493707, "Ribbon launch"],
    [1641855660, "Squeeth launch"]
  ]
}
