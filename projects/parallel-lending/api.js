const { getAPI, getTokenPrices, } = require('../helper/acala/api')
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');

module.exports = {
  misrepresentedTokens: true,
  parallel: {
    tvl: async () => {
      const chain = 'parallel'
      const api = await getAPI(chain)
      return getLendingData(api, chain)
    },
    borrowed: async () => {
      const chain = 'parallel'
      const api = await getAPI(chain)
      return getBorrowedData(api, chain)
    }
  },
  heiko: {
    tvl: async () => {
      const chain = 'heiko'
      const api = await getAPI(chain)
      return getLendingData(api, chain)
    },
    borrowed: async () => {
      const chain = 'heiko'
      const api = await getAPI(chain)
      return getBorrowedData(api, chain)
    }
  },
};

async function getLendingData(api, chain) {
  // const markets = await api.query.loans.markets.entries();
  const exchangeRates = await api.query.loans.exchangeRate.entries();
  const totalSupplies = await api.query.loans.totalSupply.entries();
  const totalBorrows = await api.query.loans.totalBorrows.entries();
  // const totalReserves = (await api.query.loans.totalSupply.entries()).map(i => +i[1].toString())
  // const ptokenIds = markets.map(i => i[1].toJSON().ptokenId)
  // const underlyingIds = await api.queryMulti(ptokenIds.map(id => {
  //   return [api.query.loans.underlyingAssetId, [id]];
  // }));
  const exchangeRateMapping = {}
  const totalSupplyMapping = {}
  const totalBorrowMapping = {}
  exchangeRates.map(([{ args }, metadata]) => {
    const [underlyingId] = args;
    exchangeRateMapping[underlyingId] = +metadata
  })
  totalSupplies.map(([{ args }, metadata]) => {
    const [underlyingId] = args;
    totalSupplyMapping[underlyingId] = +metadata
  })
  totalBorrows.map(([{ args }, metadata]) => {
    const [underlyingId] = args;
    totalBorrowMapping[underlyingId] = +metadata
  })
  const balances = {}
  Object.keys(totalSupplyMapping).forEach(token => {
    const supply = totalSupplyMapping[token]
    const rate = exchangeRateMapping[token] / 1e18
    const borrowed = totalBorrowMapping[token] || 0
    // console.log(token, supply, rate, borrowed, (supply * rate) - borrowed )
    balances[token] = (supply * rate) - borrowed
  })
  // underlyingIds.forEach((id, i) => {
  //   const token = +id.toString()
  //   console.log(token, totalReserves[i])
  //   if (totalReserves[i] > 0)
  //     balances[token] = totalReserves[token] * exchangeRateMapping[token] / 1e18
  // })
  // console.log('lendo', balances)
  const { updateBalances } = await getTokenPrices({ api, chain })
  return updateBalances(balances)
}


async function getBorrowedData(api, chain) {
  // const markets = await api.query.loans.markets.entries();
  const totalBorrows = await api.query.loans.totalBorrows.entries();
  // const ptokenIds = markets.map(i => i[1].toJSON().ptokenId)
  // const underlyingIds = await api.queryMulti(ptokenIds.map(id => {
  //   return [api.query.loans.underlyingAssetId, [id]];
  // }));
  const balances = {}
  totalBorrows.map(([{ args }, metadata]) => {
    const [underlyingId] = args;
    balances[underlyingId] = +metadata
  })
  // underlyingIds.forEach((id, i) => {
  //   const token = +id.toString()
  //   if (totalBorrows[i] > 0)
  //     balances[token] = totalBorrows[i]
  // })
  // console.log('brooro', balances)
  const { updateBalances } = await getTokenPrices({ api, chain })
  return updateBalances(balances)
}
