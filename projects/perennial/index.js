const { sumTokens2 } = require("../helper/unwrapLPs");

const DSU = {
  ethereum: "0x605D26FBd5be761089281d5cec2Ce86eeA667109",
};

const collateral = {
  ethereum: "0x2d264EBDb6632A06A1726193D4d37FeF1E5dbDcd",
};

function tvl(chain) {
  return async (_ts, _block, _cb) => {
    const tokensAndOwners = [[DSU[chain], collateral[chain]]];
    return sumTokens2({ chain, tokensAndOwners });
  };
}

module.exports = {
  ethereum: {
    tvl: tvl("ethereum"),
  },
};
