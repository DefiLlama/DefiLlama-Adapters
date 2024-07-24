const alephium = require('../helper/chain/alephium')

const Addresses = {
  alphAyinPool: '25ywM8iGxKpZWuGA5z6DXKGcZCXtPBmnbQyJEsjvjjWTy',
  alphUsdtPool: '2A5R8KZQ3rhKYrW7bAS4JTjY9FCFLJg6HjQpqSFZBqACX',
  alphWethPool: 'yXMFxdoKcE86W9NAyajc8Z3T3k2f5FGiHqHtuA69DYT1',
  ayinUsdtPool: '21NEBCk8nj5JBKpS7eN8kX6xGJoLHNqTS3WBFnZ7q8L9m',
  alphWbtcPool: '28XY326TxvSekaAwiWDLFg2QBRfacSga8dyNJCYGUYNbq',
  usdtUsdcPool: '27C75V9K5o9CkkGTMDQZ3x2eP82xnacraEqTYXA35Xuw5',
  usdt: 'zSRgc7goAYUgYsEBYdAzogyyeKv3ne3uvWb3VDtxnaEK',
  weth: 'vP6XSUyjmgWCB2B9tD5Rqun56WJqDdExWnfwZVEqzhQb',
  ayin: 'vT49PY8ksoUL6NcXiZ1t2wAmC7tTPRfFfER8n3UCLvXy',
  wbtc: 'xUTp3RXGJ1fJpCGqsAY6GgyfRQ3WQ1MdcYR1SiwndAbR',
  usdc: '22Nb9JajRpAh9A2fWNgoKt867PA6zNyi541rtoraDfKXV'
}

const XAyinAddress = 'zst5zMzizEeFYFis6DNSknY5GCYTpM85D3yXeRLe2ug3'

const TokenIds = {
  usdt: alephium.contractIdFromAddress(Addresses.usdt),
  weth: alephium.contractIdFromAddress(Addresses.weth),
  ayin: alephium.contractIdFromAddress(Addresses.ayin),
  wbtc: alephium.contractIdFromAddress(Addresses.wbtc),
  usdc: alephium.contractIdFromAddress(Addresses.usdc)
}

async function ayinTvlForXAyin() {
  const results = await alephium.contractMultiCall([
    { group: 0, address: XAyinAddress, methodIndex: 3 },
    { group: 0, address: XAyinAddress, methodIndex: 11 }
  ])

  const totalSupply = results[0].returns[0].value
  const currentPrice = results[1].returns[0].value
  return (Number(totalSupply) / 1e18) * (Number(currentPrice) / 1e18)
}

async function tvl() {
  const alphTvls = await Promise.all([
    Addresses.alphAyinPool, Addresses.alphUsdtPool, Addresses.alphWethPool
  ].map(poolAddress => alephium.getAlphBalance(poolAddress)))
  const alphTvl = alphTvls.reduce((tvl, res) => tvl + Number(res.balance), 0)
  const tokensTvls = await Promise.all([
    Addresses.alphAyinPool, Addresses.alphUsdtPool, Addresses.alphWethPool, Addresses.ayinUsdtPool,
    Addresses.alphWbtcPool, Addresses.usdtUsdcPool
  ].map(poolAddress => alephium.getTokensBalance(poolAddress)))
  const tokensTvl = tokensTvls.reduce((res, tokenTvls) => {
    tokenTvls.forEach(tokenTvl => {
      if (res[tokenTvl.tokenId] !== undefined) {
        res[tokenTvl.tokenId] = Number(res[tokenTvl.tokenId]) + Number(tokenTvl.balance)
      }
    });
    return res
  }, { [TokenIds.ayin]: 0, [TokenIds.usdt]: 0, [TokenIds.weth]: 0, [TokenIds.wbtc]: 0, [TokenIds.usdc]: 0 })
  return {
    alephium: alphTvl / 1e18,
    ayin: tokensTvl[TokenIds.ayin] / 1e18,
    weth: tokensTvl[TokenIds.weth] / 1e18,
    tether: tokensTvl[TokenIds.usdt] / 1e6,
    usdc: tokensTvl[TokenIds.usdc] / 1e6,
    bitcoin: tokensTvl[TokenIds.wbtc] / 1e8
  }
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
