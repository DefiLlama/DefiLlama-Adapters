const { ordersTvl } = require("./orders");
const { depositsTvl, borrowed } = require("./deposits");
const sdk = require("@defillama/sdk");

module.exports = {
  timetravel: false,
  solana: { tvl: sdk.util.sumChainTvls([ordersTvl, depositsTvl ]), borrowed },
};
