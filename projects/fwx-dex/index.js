const { configPost } = require('../helper/cache')


module.exports = {
  avax: {
    tvl,
  },
}

async function tvl(api) {
  const { data } = await configPost('fwx-dex/' + api.chain, "https://subgraphs.fwx.finance/subgraphs/name/fwx-exchange-avac", {
    query: `
        query ($dayUnix: Int!) {
        pairs {
          id
          token0 {
            id
          }
          token1 {
            id
          }
        }
      }
    `,
    variables: {
      dayUnix: api.timestamp
    }
  })

  const tokensAndOwners = []
  const pairs = data.pairs
  for (let i = 0; i < pairs.length; i++) {
    const pairData = pairs[i]
    const pool = pairData.id
    const token0 = pairData.token0.id
    const token1 = pairData.token1.id

    tokensAndOwners.push(
      [token0, pool],
      [token1, pool],
    );
  }

  return api.sumTokens({ tokensAndOwners })
}
