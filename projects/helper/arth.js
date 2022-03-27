const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./abis/getEntireSystemColl.abi.json");
const { default: BigNumber } = require('bignumber.js');

function getArthTvl(TROVE_ADDRESSES, COLLATERAL_ADDRESSES, chain, coingeckoIds = [], decimals = [], symbols = []) {
  return async (_, ethBlock, chainBlocks) => {
    const block = chainBlocks[chain];

    // const stabilityPoolLusdTvl = (
    //   await sdk.api.erc20.balanceOf({
    //     target: ARTH_ADDRESS,
    //     owner: STABILITY_POOL_ADDRESS,
    //     block,
    //     chain,
    //   })
    // ).output;

    const ret = {};
    const tvls = await Promise.all(
      TROVE_ADDRESSES.map(trove => sdk.api.abi.call({
          target: trove,
          abi: getEntireSystemCollAbi,
          block,
          chain,
        })
      )
    );


    COLLATERAL_ADDRESSES.forEach((collateral, index) => {
      let key = chain+':'+collateral;
      let val = tvls[index].output;

      if  (coingeckoIds[index]) key = coingeckoIds[index];

      if (ret[key] == undefined) ret[key] = BigNumber(0);
      if (decimals[index] !== undefined) val = Number(val) / (10**decimals[index]);
      ret[key] = ret[key].plus(BigNumber(val));
    });

    return ret;
  };
}

module.exports = {
  getArthTvl
};
