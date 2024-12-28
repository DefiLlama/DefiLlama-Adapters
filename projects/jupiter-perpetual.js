const { sumTokens2 } = require("./helper/solana");

module.exports = {
  hallmarks: [
    [1706490000,"launch jup exchange"]
  ],
  timetravel: false,
  methodology: "Calculate sum across all program token accounts",
  solana: {
    tvl,
  },
};

async function tvl() {
  return sumTokens2({ owner: 'AVzP2GeRmqGphJsMxWoqjpUifPpCret7LqWhD8NWQK49' });
}
