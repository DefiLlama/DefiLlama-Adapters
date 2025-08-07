const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

const BigNumber = require('bignumber.js');
const BASE = BigNumber(10 ** 18)
const { compoundExports2 } = require('../helper/compound')


let allControllers = {
  conflux: ["0x086C25ea84b8Eff7AeCf27a4543E4dE305a1c695"]
};


function getTVLByChain(chain) {
  const controllers = allControllers[chain];
  
  return async (api) => {
    // let tvl = BigNumber(0);
    controllers.map(async (controller) => {
      const oracle = await api.call({ abi: 'address:priceOracle', target: controller });
      const iTokens = await api.call({ abi: "address[]:getAlliTokens", target: controller });
      const uTokens = await api.multiCall({ abi: 'address:underlying', calls: iTokens });
      // const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: uTokens });
      // const prices = await api.multiCall({ abi: 'function getUnderlyingPrice(address uToken) view returns (uint256)', calls: iTokens.map(iToken => ({ target: oracle, params: iToken })) });
      const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: iTokens.map((iToken, i) => ({ target: uTokens[i], params: iToken })) });
      // balances.forEach((bal, i) => {
      //   const value = BigNumber(bal).times(prices[i]).div(BASE).div(BigNumber(10).pow(decimals[i]));
      //   tvl = tvl.plus(value);
      // })
      return api.addTokens(uTokens, balances);
    })
  }
}

function getLendingTvl(chain, borrowed) {
  const controllers = allControllers[chain]

  const res = controllers.map(comptroller => compoundExports2({
    comptroller, abis: { getAllMarkets:  "address[]:getAlliTokens" },
  })).map(i => borrowed ? i.borrowed : i.tvl)
  if (!borrowed) {
    // res.push(getTVLByChain(chain))
    getTVLByChain(chain)
  }
  return sdk.util.sumChainTvls(res)
}

function chainTvl(chain) {
  return {
    tvl: getLendingTvl(chain, false),
    borrowed: getLendingTvl(chain, true),
  };
}


const chains = ["conflux"]

module.exports = {
  start: '2025-05-29', // 2025-05-29 11:50:43 +08:00
}
chains.forEach(chain => {
  module.exports[chain] = chainTvl(chain) 
})
