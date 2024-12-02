const { cachedGraphQuery } = require('../helper/cache')

const config = {
  ethereum: {
    subgraphUrl: 'https://api.studio.thegraph.com/query/96517/bb-defillama-eth/v0.0.4'
  },
  bsc: {
    subgraphUrl: 'https://api.studio.thegraph.com/query/96517/bb-defillama-bsc/v0.0.2'
  },
  bouncebit: {
    main: { url: 'https://bitswap-subgraph.bouncebit.io/subgraphs/name/bb-defillama-bb' },
    boyya: { url: 'https://bitswap-subgraph.bouncebit.io/subgraphs/name/bb-defillama-boyya-bb' }
  }
}

const query = `{
  tokens {
    id
    tvl
  }
}`

// stbbtc to bbtc
const TOKEN_MAPPINGS = {
  '0x7f150c293c97172c75983bd8ac084c187107ea19': '0xf5e11df1ebcf78b6b6d26e04ff19cd786a1e81dc', // stBBTC -> bbtc
}

async function fetchTokens(chain, subgraphUrl) {
  const prefix = chain === 'bouncebit' ? `bouncebit-cedefi${subgraphUrl.includes('boyya') ? '-boyya' : ''}` : 'bouncebit-cedefi'
  return cachedGraphQuery(`${prefix}/${chain}`, subgraphUrl, query)
}

async function tvl(api) {
  const chain = api.chain
  
  const tokenLists = await Promise.all(
    chain === 'bouncebit'
      ? [
          fetchTokens(chain, config[chain].main.url),
          fetchTokens(chain, config[chain].boyya.url)
        ]
      : [fetchTokens(chain, config[chain].subgraphUrl)]
  )

  const allTokens = tokenLists.flatMap(result => result.tokens)
  
  allTokens.forEach(token => {
    if (token.tvl <= 0) return
    const targetToken = TOKEN_MAPPINGS[token.id] || token.id
    api.add(targetToken, token.tvl)
  })

  return api.getBalances()
}

module.exports = {
  methodology: "Calculate TVL by querying BounceBit Cedefi subgraph"
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})