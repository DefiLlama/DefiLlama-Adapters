const axios = require("axios");
const { queryContract, } = require('../helper/terra')

const contracts = {
  terra2_hub:
    "terra10788fkzah89xrdm27zkj5yvhj9x3494lxawzm5qq3vvxcqz2yzaqyd3enk",
};

async function terra2Tvl() {
  const res = await queryContract({ isTerra2: true, contract: contracts.terra2_hub, data: { state: { }}})

  return {
    "terra-luna-2": +res.tvl_uluna / 1e6,
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Liquid Staking and Arbitrage Protocol",
  terra2: { tvl: terra2Tvl },
};
