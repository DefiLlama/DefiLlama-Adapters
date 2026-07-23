const WINDFALL_LOTTO =
  "0x9650D206c6e0093FBc1D623b2A1e03984D24d3f1";

const POLYGON_DAI =
  "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";

async function tvl(api) {
  return api.sumTokens({
    owner: WINDFALL_LOTTO,
    tokens: [POLYGON_DAI],
  });
}

module.exports = {
  methodology:
    "Counts DAI held by the Windfall Lotto smart contract on Polygon, " +
    "including jackpot funds, rollovers, donations, and unclaimed prizes.",

  start: 1775388703,

  polygon: {
    tvl,
  },
};
