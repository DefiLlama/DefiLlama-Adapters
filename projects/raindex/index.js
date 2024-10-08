const { request } = require("graphql-request");

const orderbooks = {
  arbitrum: {
    address: "0x550878091b2b1506069f61ae59e3a5484bca9166",
    sg: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-arbitrum/0.1/gn",
  },
  base: {
    address: "0xd2938e7c9fe3597f78832ce780feb61945c377d7",
    sg: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-base/0.7/gn",
  },
  bsc: {
    address: "0xd2938e7c9fe3597f78832ce780feb61945c377d7",
    sg: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-bsc/0.1/gn",
  },
  flare: {
    address: "0xcee8cd002f151a536394e564b84076c41bbbcd4d",
    sg: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-flare/0.2/gn",
  },
  linea: {
    address: "0x22410e2a46261a1b1e3899a072f303022801c764",
    sg: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-linea/0.1/gn",
  },
  polygon: {
    address: "0x7d2f700b1f6fd75734824ea4578960747bdf269a",
    sg: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-polygon/0.4/gn",
  },
}

const query = `
  query Tokens($first: Int, $skip: Int) {
    erc20S(first: $first, skip: $skip) {
      address
      decimals
      name
      symbol
    }
  }
`

// get all token addresses currently held by the contract
async function getTokens(sg) {
  let page = 0;
  const tokens = [];

  // catch errors in case anything goes wrong with underlying subgraph endpoint
  try {
    for(;;) {
      const { erc20S } = await request(sg, query, {
        first: 50,
        skip: 50 * page
      });
      page++
      if (erc20S && erc20S.length) {
        tokens.push(...erc20S)
        if (erc20S.length < 50) break;
      } else {
        break;
      }
    }
  } catch {
    /**/
  }

  return tokens
}

async function tvl(api) {
  const { address, sg } = orderbooks[api.chain]

  const tokens = await getTokens(sg);
  const balances = await api.multiCall({
    calls: tokens.map(token => ({
      target: token.address,
      params: [address]
    })),
    abi: 'erc20:balanceOf',
    chain: api.chain,
  });
  
  api.addTokens(tokens.map(t => t.address), balances)
}

module.exports = {
  methodology: 'Balance of ERC20 tokens held by contract.',
}; 

Object.keys(orderbooks).forEach(chain => {
  module.exports[chain] = { tvl }
})
