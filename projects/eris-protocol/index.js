const axios = require("axios");
const { queryContract } = require("../helper/terra");

// For testing run
// node test.js projects/eris-protocol/index.js

const contracts = {
  terra2_hub:
    "terra10788fkzah89xrdm27zkj5yvhj9x3494lxawzm5qq3vvxcqz2yzaqyd3enk",
  terra_hub: "terra1zmf49p3wl7ck2cwer7kghzumfpwhfqk6x893ah",
};

async function terra2Tvl() {
  const res = await queryContract({
    isTerra2: true,
    contract: contracts.terra2_hub,
    data: { state: {} },
  });

  return {
    "terra-luna-2": +res.tvl_uluna / 1e6,
  };
}

async function terraTvl() {
  const res = await queryContract({
    isTerra2: false,
    contract: contracts.terra_hub,
    data: { state: {} },
  });

  return {
    "terra-luna": +res.tvl_uluna / 1e6,
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Liquid Staking and Arbitrage Protocol",
  terra2: { tvl: terra2Tvl },
  terra: { tvl: terraTvl },
};
