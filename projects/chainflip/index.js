const { staking } = require('../helper/staking')
const { graphQuery } = require('../helper/http');
const { sumTokens2 } = require('../helper/unwrapLPs');

const STATE_CHAIN_GATEWAY_CONTRACT = '0x826180541412D574cf1336d22c0C0a287822678A';
const FLIP_TOKEN = '0x6995ab7c4d7f4b03f467cf4c8e920427d9621dbd'

const poolsDataQuery = `{
    allPools {
        nodes {
            baseAsset
            baseLiquidityAmount
            quoteAsset
            quoteLiquidityAmount
        }
    }
    allBoostPools {
        nodes { 
            asset
            chain
            feeTierPips
            availableAmount
            unavailableAmount
        }
    }
    allDepositBalances {
        groupedAggregates(groupBy: ASSET) {
            sum {
                amount
            }
            keys
        }
    }
}`

const endpoint = 'https://cache-service.chainflip.io/graphql'

async function tvl(api) {
  // Call GraphQL and get tokens, add each to balance
  const { 
    allPools: { nodes }, 
    allBoostPools: { nodes: bNodes }, 
    allDepositBalances: { groupedAggregates: uNodes } 
  } = await graphQuery(endpoint, poolsDataQuery);

  nodes.forEach(i => {
    api.add(i.baseAsset, i.baseLiquidityAmount)
    api.add(i.quoteAsset, i.quoteLiquidityAmount)
  })
  bNodes.forEach(i => {
    api.add(i.asset, i.availableAmount)
    api.add(i.asset, i.unavailableAmount)
  })
  uNodes.forEach(i => {
    api.add(i.keys[0], i.sum.amount)
  })
  return sumTokens2({ api })
}

module.exports = {
  methodology: 'The number of FLIP tokens in the Chainflip State Chain Gateway Contract, as well as the total liquidity.',
  start: '2023-11-23', // FLIP went live on 2023-11-23 12:00 UTC
  ethereum: {
    tvl: () => ({}),
    staking: staking(FLIP_TOKEN, STATE_CHAIN_GATEWAY_CONTRACT),
  },
  chainflip: {
    tvl,
  }
};
