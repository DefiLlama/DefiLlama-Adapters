const { queryContract } = require('../helper/chain/cosmos')
const { sumTokens } = require('../helper/sumTokens')

// Blacklist suspicious tokens
const blacklistedTokens = [
  'ibc:FBB3FEF80ED2344D821D4F95C31DBFD33E4E31D5324CAD94EF756E67B749F668' // yieldeth-wei - is returing the wrong price: price: 155633670
]

async function tvl(api) {
  const { chain } = api
  const { factory } = config[chain]
  // Get a list of marketIds from the factory contract
  // Iterate over the markets and request the balance of each market's collateral token
  const marketIds = await getMarketIds(chain, factory)
  const _getMarketAddr = (marketId) => getMarketAddr(chain, factory, marketId)
  
  const result = await sumTokens({ 
    chain, 
    owners: await Promise.all(marketIds.map(_getMarketAddr)),
    blacklistedTokens 
  })
  
  // Filter out the blacklisted token from the results
  if (result['ibc:FBB3FEF80ED2344D821D4F95C31DBFD33E4E31D5324CAD94EF756E67B749F668']) {
    delete result['ibc:FBB3FEF80ED2344D821D4F95C31DBFD33E4E31D5324CAD94EF756E67B749F668']
  }
  
  return result
}

async function getMarketIds(chain, factory) {
    const market_ids = [];

    while(true) {
      const resp = await queryContract({
        contract: factory,
        chain: chain,
        data: { markets: {
          start_after: market_ids.length ? market_ids[market_ids.length - 1] : undefined,
        } }
      });

      if(!resp || !resp.markets) {
        throw new Error(`could not get markets on chain ${chain}`);
      }
        
      if(!resp.markets.length) {
          break;
      }

      market_ids.push(...resp.markets);
    } 

    return market_ids 
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
  neutron: { factory: 'neutron1an8ls6d57c4qcvjq0jmm27jtrpk65twewfjqzdn7annefv7gadqsjs7uc3' }
}


for(const chain of Object.keys(config)) {
  module.exports[chain] = { tvl }
}
