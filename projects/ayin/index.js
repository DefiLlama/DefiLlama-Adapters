const alephium = require('../helper/chain/alephium')

const Addresses = {
  alphAyinPool: '25ywM8iGxKpZWuGA5z6DXKGcZCXtPBmnbQyJEsjvjjWTy',
  alphUsdtPool: '2A5R8KZQ3rhKYrW7bAS4JTjY9FCFLJg6HjQpqSFZBqACX',
  alphUsdcPool: '283R192Z8n6PhXSpSciyvCsLEiiEVFkSE6MbRBA4KSaAj',
  alphWethPool: 'yXMFxdoKcE86W9NAyajc8Z3T3k2f5FGiHqHtuA69DYT1',
  alphWbtcPool: '28XY326TxvSekaAwiWDLFg2QBRfacSga8dyNJCYGUYNbq',
  alphApadPool: 'vFpZ1DF93x1xGHoXM8rsDBFjpcoSsCi5ZEuA5NG5UJGX',
  alphChengPool: '25b5aNfdrNRjJ7ugPTkxThT51L1NSvf8igQyDHKZhweiK',
  alphAnsdPool: 'uM4QJwHqFoTF2Pou8TqwhaDiHYLk4SHG65uaQG8r7KkT',
  alphAlphagaPool: '23cXw23ZjRqKc7i185ZoH8vh9KT4XTumVRWpVLUecgLMd',
  ayinUsdtPool: '21NEBCk8nj5JBKpS7eN8kX6xGJoLHNqTS3WBFnZ7q8L9m',
  ayinUsdcPool: '2961aauvprhETv6TXGQRc3zZY4FbLnqKon2a4wK6ABH9q',
  ayinApadPool: '247rZysrruj8pj2GnFyK2bqB2nU4JsUj7k2idksAp4XMy',
  usdtUsdcPool: '27C75V9K5o9CkkGTMDQZ3x2eP82xnacraEqTYXA35Xuw5',
}
const alephId = '0000000000000000000000000000000000000000000000000000000000000000'

const XAyinAddress = 'zst5zMzizEeFYFis6DNSknY5GCYTpM85D3yXeRLe2ug3'

async function ayinTvlForXAyin() {
  const results = await alephium.contractMultiCall([
    { group: 0, address: XAyinAddress, methodIndex: 3 },
    { group: 0, address: XAyinAddress, methodIndex: 11 }
  ])

  const totalSupply = results[0].returns[0].value
  const currentPrice = results[1].returns[0].value
  return (Number(totalSupply) / 1e18) * (Number(currentPrice) / 1e18)
}

async function tvl(api) {
  const alphTvls = await Promise.all([
    Addresses.alphAyinPool, Addresses.alphUsdtPool, Addresses.alphUsdcPool, Addresses.alphWethPool, Addresses.alphApadPool, Addresses.alphChengPool, Addresses.alphAnsdPool, Addresses.alphAlphagaPool
  ].map(poolAddress => alephium.getAlphBalance(poolAddress)))
  const alphTvl = alphTvls.reduce((tvl, res) => tvl + Number(res.balance), 0)
  api.add(alephId, alphTvl)
  const tokensTvls = await Promise.all(Object.values(Addresses).map(poolAddress => alephium.getTokensBalance(poolAddress)))
  tokensTvls.forEach((tokenTvls) => {
    tokenTvls.forEach(tokenTvl => {
      api.add(tokenTvl.tokenId, tokenTvl.balance)
    });
  })
}

async function staking() {
  const xAyinTvl = await ayinTvlForXAyin()
  return {
    ayin: xAyinTvl,
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL locked in the Ayin pools on Alephium',
  alephium: { tvl, staking, }
}
