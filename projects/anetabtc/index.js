const { get } = require('../helper/http')
const { getAssets } = require('../helper/chain/cardano/blockfrost')

let tokenPrice
const DAY = 24 * 60 * 60 * 1000
const aDayAgo = new Date() - DAY

async function getTokenPrice() {
  if (!tokenPrice) tokenPrice = _getTokenPrice()
  return tokenPrice

  async function _getTokenPrice() {
    const data = await get('https://api.ergodex.io/v1/amm/markets?from='+aDayAgo)
    const priceObj = data.find(i => i.quoteSymbol === 'NETA' && i.baseSymbol === 'ERG')
    return 1/priceObj.lastPrice
  }
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  cardano: {
    tvl: () => ({}),
    staking: async () => {
      const data = await getAssets('addr1w8p79rekquuw5kmdg4z36y9gpnm88k5huddwqluk9mjjeqgc3xmss')
      const balance = data.find(i => i.unit === 'b34b3ea80060ace9427bda98690a73d33840e27aaa8d6edb7f0c757a634e455441').quantity
      return {
        ergo: +balance * (await getTokenPrice())
      }
    }
  },
  ergo: {
    staking: async () => {
      const api = 'https://api.ergoplatform.com/api/v1/addresses/5ASYVJ2w8tH3bDQx5ZLz6rZUdokD1kmTXSRZ8GfrsAUW4vqy9eg5omtTYVzY22ibHANf7GgSc2E5FiThgo8qXzWpU3RDLohN277hksbAf9yykajXbYPUaXUeMPfSXbS1GdE4y2GoYKaXHR3H57MV5CDZE58YteqWe3XVXzmMvj1192AD7UZ1N6nguRfjgijxEWTrLq2ZrykjRAut2JBGYHanAKn46tYWW3chpxNosXG7ZW2ShDzKju2ttHhfxeZVMBydryuoEya5E9KVagjsfa9E2qPUdLpbh8enppVWcwoQ4GF1ktgzSX32QbfKhfpD23iWQixThUbcCca14FjXDt94GVFPuhAT5tQyiKen863Cq5eRAEgsQ7otX6pWa32Q28sxSF9Az4abwiJKNbFhbhb3cDCs6A45ZnW6aB6AkfwTJSAZ2ZzqqG7LXT4HdxNpdmiwno9sJWxPf2PC4vRhVqBPdxxyCgoodjyutf4UuinSCibhfqdhUJLc1JM8zX9UcD699mChgUZoKE8kXD4soVGSgQD3qfGXC6RP7n8dtowArNLm3H5QJ3EobDCbEgECLHFaHN2BPwwWscAt5eejKeFvkp3CuQ3mqFW7vfQG4n9tTLnshj8cjxnpkBdfFKC83sW8A3AoZAX4K1UrhndfLSFh4w/balance/confirmed'
      const data = await get(api)
      const tokenData = data.tokens.find(i => i.tokenId === '472c3d4ecaa08fb7392ff041ee2e6af75f4a558810a74b28600549d5392810e8')
      return {
        ergo: tokenData.amount * (await getTokenPrice())/(10 ** tokenData.decimals)
      }
    }
  }
}