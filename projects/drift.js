const { sumTokens2, } = require("./helper/solana");

module.exports = {
  timetravel: false,
  methodology: "Calculate sum across all program token accounts",
  solana: {
    tvl,
  },
};

async function tvl() {
  return sumTokens2({
    owners: [
      'CU4eFxpyCGNDEXN27Jonn7RfgwBt3cnp7TcTrJF6EW9Q', // legacy
      'JCNCMFXo5M5qwUPg2Utu1u6YWp3MbygxqBsBeXXJfrw', // Drift vault
    ],
  })
}
