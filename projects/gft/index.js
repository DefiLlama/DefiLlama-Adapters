const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const contracts = require("./contracts.json");
const { sumLPWithOnlyOneToken } = require("./../helper/unwrapLPs");
const BigNumber = require("bignumber.js");

const iotx = "0x6fb3e0a217407efff7ca062d46c26e5d60a14d69";
const wiotx = ADDRESSES.iotex.WIOTX;

const gfsBonusStackPool = "0x4346a618c2e3fd4cfa821e91216eaf927bd46ddd";
const gfs = "0x5d0f4ca481fd725c9bc6b415c0ce5b3c3bd726cf";
const gfsLiquidityPool = "0x19f3cb6a4452532793d1605c8736d4a94f48752c";

function pool2(chain, gasToken) {
  return async (timestamp, _, {[chain]: block}) => {
    let balances = { iotex: 0 };
    for (let contract of Object.entries(contracts[chain])) {
      await sumLPWithOnlyOneToken(
        balances,
        contract[1].token,
        contract[1].address,
        wiotx,
        block,
        "iotex"
      );
    }

    // bonus stack pool
    const [balanceOfTokenListedInLP, balanceOfLP, balanceOfStackPool] = await Promise.all([
      sdk.api.erc20.balanceOf({
        target: wiotx,
        owner: gfsLiquidityPool,
        block,
        chain
      }),
      sdk.api.erc20.balanceOf({
        target: gfs,
        owner: gfsLiquidityPool,
        block,
        chain
      }),
      sdk.api.erc20.balanceOf({
        target: gfs,
        owner: gfsBonusStackPool,
        block,
        chain
      }),
    ])
    sdk.util.sumSingleBalance(balances, wiotx, BigNumber(balanceOfTokenListedInLP.output).times(balanceOfStackPool.output).div(balanceOfLP.output).toFixed(0))

    if (iotx in balances) {
      balances["iotex"] += balances[iotx] / 10 ** 18;
      delete balances[iotx];
    }
    if (wiotx in balances) {
      balances["iotex"] += balances[wiotx] / 10 ** 18;
      delete balances[wiotx];
    }

    return balances;
  };
}

module.exports = {
  iotex: {
    tvl: () => ({}),
    pool2: pool2("iotex"),
  },
};
