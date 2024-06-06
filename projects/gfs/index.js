const ADDRESSES = require('../helper/coreAssets.json')
const contracts = require("./contracts.json");
const { sumLPWithOnlyOneToken } = require("./../helper/unwrapLPs");

const iotx = "0x6fb3e0a217407efff7ca062d46c26e5d60a14d69";
const wiotx = ADDRESSES.iotex.WIOTX;

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
