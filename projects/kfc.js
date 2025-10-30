const { post } = require("./helper/http") 

// KaspaFinance Mainnet Subgraph endpoint
const SUBGRAPH_URL = 'https://graph.kaspafinance.io/subgraphs/name/mainnet-kaspa-finance-exchange-v3'
const QUERY = `
{
  factory(id: "0x09Df701f1f5df83A3BbEf7DA4e74Bb075199d6A4") {
    totalValueLockedUSD
  }
}
`
async function tvl() {
  try {
    const res = await post(SUBGRAPH_URL, { query: QUERY })
    const tvlUsd = Number(res.data?.factory?.totalValueLockedUSD ?? 0)
    return { tether: tvlUsd } 
  } catch (e) {
    console.error('Subgraph TVL fetch failed:', e)
    return {}
  }
}

module.exports = {
  kasplex: {
    tvl,
    name: 'Kaspa Finance V3 (KFC)',
    logo: 'https://app.kaspafinance.io/images/chains/0xf87e587ab945f7b111329a6ace6dc497d34f098b.png',
  },
  methodology:
    'TVL is fetched directly from KaspaFinance’s official subgraph, which aggregates the total USD value of all liquidity in Uniswap V3-style pools deployed by the factory.',
}
