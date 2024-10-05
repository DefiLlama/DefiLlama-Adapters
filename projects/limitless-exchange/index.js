const { getLogs2 } = require('../helper/cache/getLogs')
const eventAbi = "event FixedProductMarketMakerCreation(address indexed creator, address fixedProductMarketMaker, address indexed conditionalTokens, address indexed collateralToken, bytes32[] conditionIds, uint256 fee)";
const config = [
  { factory: "0x8E50578ACa3C5E2Ef5ed2aA4bd66429B5e44C16E", resolver: "0x15A61459d65D89A25a9e91e0dc9FC69598791505", fromBlock: 13547870 },
  { factory: "0xc397D5d70cb3B56B26dd5C2824d49a96c4dabF50", resolver: "0xc9c98965297bc527861c898329ee280632b76e18", fromBlock: 13547845 },
];

const getMarkets = async ({ factory, resolver, fromBlock }, api) => {
  const logs = await getLogs2({ api, target: factory, eventAbi, fromBlock });
  const tokens = logs.map(i => i.collateralToken)
  return api.sumTokens({ owner: resolver, tokens });
};

const tvl = async (api) => {
  for (const marketConfig of config) {
    await getMarkets(marketConfig, api);
  }
};

module.exports = {
  methodology: "The TVL represents the total amount of tokens deposited in the prediction markets",
  base: { tvl }
};
