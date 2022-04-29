const { getBlock } = require("../helper/getBlock");
const {
    sumLPWithOnlyOneTokenOtherThanKnown,
} = require("./../helper/unwrapLPs");

const lpToken = "0x2a382b6d2dac1cba6e4820fd04e3c2c14e1aa7b2";
const treasuryAddress = "0xdE2957506B6dC883963fbE9cE45a94a8A22c6006";
const mtgoToken = "0x1bc8547e3716680117d7ba26dcf07f2ed9162cd0";
const poolAddress = "0x1781d2e9b4c7c0a3657411a64d2c1dfc50118772";
const wiotx = "0xA00744882684C3e4747faEFD68D283eA44099D03";
const erc20Tokens = [
  ["0x1bc8547e3716680117d7ba26dcf07f2ed9162cd0", false], // MTGO
];

async function iotexPool2(timestamp, block, chainBlocks) {
  block = await getBlock(timestamp, "iotex", chainBlocks);
  const balances = {};
  await sumLPWithOnlyOneTokenOtherThanKnown(
    balances,
    lpToken,
    poolAddress,
    mtgoToken,
    block,
    "iotex"
  );
  return { iotex: (balances[wiotx] / 10 ** 18) };
}

async function treasury(timestamp, block, chainBlocks) {

  block = await getBlock(timestamp, "iotex", chainBlocks);
  const balances = {};
  await sumLPWithOnlyOneTokenOtherThanKnown(
    balances,
    lpToken,
    treasuryAddress,
    mtgoToken,
    block,
    "iotex"
  );
  return { iotex: (balances[wiotx] / 10 ** 18) };
}

module.exports = {
  iotex: {
    tvl: async () => ({}),
    pool2: iotexPool2,
    treasury,
  },
};
