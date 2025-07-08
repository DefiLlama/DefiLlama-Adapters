const { sumTokens2 } = require("../helper/solana");

async function tvl() {
  return sumTokens2({ owner: '81xGAvJ27ZeRThU2JEfKAUeT4Fx6qCCd8WHZpujZbiiG', });
}

module.exports = {
  timetravel: false,
  methodology:
    "tvl is the usd equivalent value of all the assets in our pools.",
  solana: {
    tvl
  },
};
