const XU3O8_CONTRACT = '0x79052Ab3C166D4899a1e0DD033aC3b379AF0B1fD';
const GRAPH_URL = 'https://api.studio.thegraph.com/query/94382/exchange-v3-etherlink-tmp/version/latest'

async function tvl(api) {
    const { token } = await fetch(GRAPH_URL, {
      body: JSON.stringify({
        query: `{
          token(id: "${XU3O8_CONTRACT.toLowerCase()}") {
            totalValueLockedUSD
          }
        }`
      }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()).then(res => res.data);

    console.log('Token balance:', token.totalValueLockedUSD)
    const value = parseInt(token.totalValueLockedUSD)
    api.add(XU3O8_CONTRACT, value)
}

module.exports = {
  methodology: 'Counts the balance of tokens in the XU3O8 contract',
  etlk: {
    tvl,
  },
}; 