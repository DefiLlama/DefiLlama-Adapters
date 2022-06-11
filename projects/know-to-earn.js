// 0x515343ed04b054d098a0c15cbd7f98b0250d0b38  KNOW token
// 0x767eded9032ce68dc4e475addf0059baab936585    lp token
// 0xEA934138CFEF2c5efedf2b670B93Fb6827295cC4   owner

const sdk = require("@defillama/sdk");
const { getBlock } = require("./helper/getBlock");
const { sumLPWithOnlyOneToken } = require("./helper/unwrapLPs");

const iotx = "0x6fb3e0a217407efff7ca062d46c26e5d60a14d69";
const wiotx = "0xA00744882684C3e4747faEFD68D283eA44099D03";

function pool2(chain, gasToken) {
  return async (timestamp, block, chainBlocks) => {
    block = await getBlock(timestamp, chain, chainBlocks);
    let balances = { iotex: 0 };
    
    await sumLPWithOnlyOneToken(
      balances,
      '0x767eded9032ce68dc4e475addf0059baab936585',
      '0xEA934138CFEF2c5efedf2b670B93Fb6827295cC4',
      wiotx,
      block,
      "iotex"
    );

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
    pool2: pool2("iotex", "iotex"),
    tvl: () => ({}),
  },
};
