const { sumTokens, call, } = require('../helper/chain/elrond')
const { cachedGraphQuery } = require('../helper/cache')
const { nullAddress } = require('../helper/tokenMapping')

const hatom = 'HTM-f51d55'

async function getMoneyMarkets() {
  const { queryMoneyMarket: res } = await cachedGraphQuery('hatom-TVLLendingProtocolQuery', 'https://mainnet-api.hatom.com/graphql', `
    query QueryMoneyMarket {
      queryMoneyMarket {
        address
        underlying {
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

const tvl = async () => {
  const moneyMarkets = await getMoneyMarkets()
  return sumTokens({ owners: moneyMarkets.map(i => i.address), })
};

const borrowed = async (_, _1, _2, { api }) => {
  const moneyMarkets = await getMoneyMarkets()
  const tokens = moneyMarkets.map(i => i.underlying.id)
  const bals = await Promise.all(moneyMarkets.map(i => call({ target: i.address, abi: 'getTotalBorrows', responseTypes: ['number'] })))
  api.addTokens(tokens, bals)
};

const staking = async (_, _1, _2, { api }) => {
  const hatomBooster = 'erd1qqqqqqqqqqqqqpgqw4dsh8j9xafw45uwr2f6a48ajvcqey8s78sstvn7xd'
  const bals = await call({ target: hatomBooster, abi: 'getTotalStake', responseTypes: ['number'] })
  api.add(hatom, bals.toString())
  return api.getBalances()
};

module.exports = {
  timetravel: false,
  elrond: {
    tvl,
    borrowed,
    staking,
  },
};
