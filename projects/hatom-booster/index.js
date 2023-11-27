const { call } = require('../helper/chain/elrond')
const { cachedGraphQuery } = require('../helper/cache')
const { nullAddress } = require('../helper/tokenMapping')

const boosterContractAddress = 'erd1qqqqqqqqqqqqqpgqw4dsh8j9xafw45uwr2f6a48ajvcqey8s78sstvn7xd'

async function getMoneyMarkets() {
   const { queryMoneyMarket: res } = await cachedGraphQuery('hatom-TVLLendingProtocolQuery', 'https://mainnet-api.hatom.com/graphql', `
    query QueryMoneyMarket {
      queryMoneyMarket {
        address
        underlying {
          symbol
          name
          decimals
          id
        }
      }
    }
  `)
   res.forEach(i => {
      if (i.underlying.id === 'EGLD') i.underlying.id = nullAddress
   })
   return res
}

const tvl = async (_, _1, _2, { api }) => {
   const moneyMarkets = await getMoneyMarkets()
   const htmTokenId = moneyMarkets.find(i => i.underlying.symbol === 'HTM').underlying.id
   const totalStaked = await call({
      target: boosterContractAddress,
      abi: 'getTotalStake',
      responseTypes: ['number']
   })
   api.addTokens([htmTokenId], [totalStaked.toString()])
};

module.exports = {
   timetravel: false,
   elrond: {
      tvl
   },
};
