
const { sumTokensExport } = require("../helper/unwrapLPs");

const ioUSDC = '0x3b2bf2b523f54c4e454f08aa286d03115aff326c'
const ioUSDT = '0x6fbcdc1169b5130c59e72e51ed68a84841c98cd1'
const USDQ = '0xEE43369197F78CFDF0D8fc48D296964C50AC7B57'

module.exports = {
  iotex: { tvl: sumTokensExport({ owner: USDQ, tokens: [ioUSDC, ioUSDT], })},
  methodology: `The calculation method for Quenta's TVL is the total value of all stablecoins (ioUSDC, ioUSDT) staked in the USDQ contract.`,
};
