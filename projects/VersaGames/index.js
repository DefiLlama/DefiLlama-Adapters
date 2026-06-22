const { staking } = require("../helper/staking");
const config = {
  tokens: {
    versa: {
      id: "versa",
      symbol: "VERSA",
      addresses: {
        "0x19": "0x00d7699b71290094ccb1a5884cd835bd65a78c17",
      },
      decimals: 18,
    },
    xversa: {
      id: "xversa",
      symbol: "xVERSA",
      addresses: {
        "0x19": "0x8216E362d07741b562eBB02C61b1659B6B1258aD",
      },
      decimals: 18,
    },
  },
  chains: {
    cronos: {
      id: "0x19",
      name: "cronos",
    },
  },
};

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
