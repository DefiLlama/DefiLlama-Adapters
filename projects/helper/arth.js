const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./abis/getEntireSystemColl.abi.json");
const getReserveAbi = require("./abis/getReserves.json");
const token0Abi = require("./abis/token0.json");
const token1Abi = require("./abis/token1.json");
const totalSupplyAbi = require("./abis/totalSupply.json");
const userInfoAbi = require("./abis/userInfo.json");
const pidAbi = require("./abis/pid.json");

const { default: BigNumber } = require("bignumber.js");

const getResponse = async (target, abi, block, chain, params = []) => {
  if (params.length < 0)
    return await sdk.api.abi.call({
      target: target,
      abi: abi,
      block,
      chain,
    });
  else
    return await sdk.api.abi.call({
      target: target,
      abi: abi,
      block,
      params,
      chain,
    });
};

function getArthTvl(
  TROVE_ADDRESSES,
  COLLATERAL_ADDRESSES,
  chain,
  coingeckoIds = [],
  decimals = [],
  symbols = []
) {
  return async (_, ethBlock, chainBlocks) => {
    const block = chainBlocks[chain];

    const ret = {};
    const tvls = await Promise.all(
      TROVE_ADDRESSES.map((trove) =>
        sdk.api.abi.call({
          target: trove,
          abi: getEntireSystemCollAbi,
          block,
          chain,
        })
      )
    );

    COLLATERAL_ADDRESSES.forEach(async (collateral, index) => {
      const collateralKeys = Object.keys(collateral);
      let key = chain + ":" + collateral[collateralKeys[0]][0];
      let val = tvls[index].output;

      if (coingeckoIds[index]) key = coingeckoIds[index];

      if (ret[key] == undefined) ret[key] = BigNumber(0);

      if (collateralKeys[0].includes("lps")) {
        //if lp tokens
        const tokenA = await getResponse(
          collateral[collateralKeys[0]][1],
          token0Abi,
          block,
          chain
        );
        const tokenB = await getResponse(
          collateral[collateralKeys[0]][1],
          token1Abi,
          block,
          chain
        );
        const lpTokenAmounts = await getResponse(
          collateral[collateralKeys[0]][1],
          getReserveAbi,
          block,
          chain
        );
        const totalSupplyLP = await getResponse(
          collateral[collateralKeys[0]][1],
          totalSupplyAbi,
          block,
          chain
        );
        const pid = await getResponse(
          collateral[collateralKeys[0]][0],
          pidAbi,
          block,
          chain
        );
        const balanceOf = await getResponse(
          collateral[collateralKeys[0]][2],
          userInfoAbi,
          block,
          chain,
          [pid.output, collateral[collateralKeys[0]][0]]
        );
        let keyA = chain + ":" + tokenA.output; // lp,token0
        let keyB = chain + ":" + tokenB.output; // lp.token1
        let reserveA = lpTokenAmounts.output["_reserve0"];
        let reserveB = lpTokenAmounts.output["_reserve1"];
        let totalSupply = totalSupplyLP.output; // lp.totalSupply()
        let amountStaked = balanceOf.output; // balanceOf lp token for lp-s in masterchef

        let percentageStaked = amountStaked.amount / totalSupply;

        if (ret[keyA] == undefined) ret[keyA] = BigNumber(0);
        ret[keyA] = ret[keyA].plus(
          BigNumber(Math.floor(Number(reserveA) * percentageStaked))
        );
        // console.log(ret);

        if (ret[keyB] == undefined) ret[keyB] = BigNumber(0);
        ret[keyB] = ret[keyB].plus(
          BigNumber(Math.floor(Number(reserveB) * percentageStaked))
        );
        // console.log(ret);
      } else {
        if (decimals[index] !== undefined)
          val = Number(val) / 10 ** decimals[index];
        ret[key] = ret[key].plus(BigNumber(val));
      }
    });

    console.log(ret);

    return ret;
  };
}

module.exports = {
  getArthTvl,
};
