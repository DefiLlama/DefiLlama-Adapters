const { cachedGraphQuery } = require('../helper/cache')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  ethereum: {
    subgraphUrl: 'https://api.studio.thegraph.com/query/96517/bb-defillama-eth/v0.0.4'
  },
  bsc: {
    subgraphUrl: 'https://api.studio.thegraph.com/query/96517/bb-defillama-bsc/v0.0.2',
    subgraphUrl2: 'https://api.studio.thegraph.com/query/96517/bb-vip-defillama-bsc/v0.0.1'
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

const PROMO_BTCB_STAKE_ABI =
  "function totalStaked() view returns (uint256)";

async function tvl(api) {
  const chain = api.chain
  
  const tokenLists = await Promise.all(
    chain === 'bouncebit'
      ? [
          fetchTokens(chain, config[chain].main.url),
          fetchTokens(chain, config[chain].boyya.url)
        ]
      : chain === 'bsc'
      ? [
          fetchTokens(chain, config[chain].subgraphUrl),
          fetchTokens(chain, config[chain].subgraphUrl2)
        ]
      : [fetchTokens(chain, config[chain].subgraphUrl)]
  )

  const allTokens = tokenLists.flatMap(result => result.tokens)
  
  allTokens.forEach(token => {
    if (token.tvl <= 0) return
    const targetToken = TOKEN_MAPPINGS[token.id] || token.id
    api.add(targetToken, token.tvl)
  })

  if (chain === 'bsc') {
    const BTCBStaked = await api.call({  abi: PROMO_BTCB_STAKE_ABI, target: '0x471461A60EC3855DC58E00De81E3510b8945D2f9'})  
    api.add(ADDRESSES.bsc.BTCB, BTCBStaked)
  }

  return api.getBalances()
}

module.exports = {
  methodology: "Calculate TVL by querying BounceBit Cedefi subgraph"
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})