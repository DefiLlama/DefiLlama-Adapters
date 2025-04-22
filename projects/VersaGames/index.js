const { staking } = require("../helper/staking");
const { config } = require("./config");

const chain = config.chains["cronos"];
const versaAddress = config.tokens["versa"].addresses[chain.id];
const xVersaAddress = config.tokens["xversa"].addresses[chain.id];

module.exports = {
    cronos: {
    staking: staking(xVersaAddress, versaAddress, chain.name),
    tvl: () => ({}),
  },
  methodology: "TVL is calculated as value of tokens in VERSA-xVERSA staking",
};
