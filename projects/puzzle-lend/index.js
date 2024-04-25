const { sumTokens, dataSearch } = require('../helper/chain/waves')
const markets = ['3P4uA5etnZi4AmBabKinq2bMiWU8KcnHZdH', '3P8Df2b7ywHtLBHBe8PBVQYd3A5MdEEJAou', '3P4DK5VzDwL3vfc5ahUEhtoe5ByZNyacJ3X', '3PHpuQUPVUoR3AYzFeJzeWJfYLsLTmWssVH', '3PAd9Aqg3cQSzu26MFYWQYcjSXPVCJtuf5V', '3P4kBiU4wr2yV1S5gMfu3MdkVvy7kxXHsKe']

module.exports = {
  timetravel: false,
  waves: {
    tvl: api => sumTokens({ api, owners: markets, includeWaves: true, }),
    borrowed,
  }
}

async function borrowed(api) {
  for (const market of markets) {
    const result = await dataSearch(market, "total_borrowed.*")
    for (const { key, value } of result) {
      api.add(key.replace('total_borrowed_', ''), value)
    }
  }
}
