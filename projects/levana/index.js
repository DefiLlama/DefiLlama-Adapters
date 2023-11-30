const { queryContract, sumTokens } = require('../helper/chain/cosmos')

async function tvl(_, _b, _cb, { api, }) {
  const { chain } = api
  const { factory } = config[chain]
  // Get a list of marketIds from the factory contract
  // Iterate over the markets and request the balance of each market's collateral token
  const marketIds = await getMarketIds(chain, factory)
  const _getMarketAddr = (marketId) => getMarketAddr(chain, factory, marketId)
  return sumTokens({ chain, owners: await Promise.all(marketIds.map(_getMarketAddr)), })
}

async function getMarketIds(chain, factory) {
  const markets = await queryContract({
    contract: factory,
    chain: chain,
    data: { markets: {} }
  });

  return markets.markets
}

async function getMarketAddr(chain, factory, marketId) {
  const marketInfo = await queryContract({
    contract: factory,
    chain: chain,
    data: { market_info: { market_id: marketId } }
  });

  return marketInfo.market_addr;
}

module.exports = {
  timetravel: false,
  methodology: "TVL is the sum of deposits into the Liquidity pools combined with the sum of trader collateral for open and pending positions",
}

const config = {
  osmosis: { factory: 'osmo1ssw6x553kzqher0earlkwlxasfm2stnl3ms3ma2zz4tnajxyyaaqlucd45' },
  sei: { factory: 'sei18rdj3asllguwr6lnyu2sw8p8nut0shuj3sme27ndvvw4gakjnjqqper95h' },
  injective: { factory: 'inj1vdu3s39dl8t5l88tyqwuhzklsx9587adv8cnn9' },
}


for(const chain of Object.keys(config)) {
  module.exports[chain] = { tvl }
}
