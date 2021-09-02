const BigNumber = require("bignumber.js");
const { request, gql } = require("graphql-request");

const subgraphUrl = 'https://api.thegraph.com/subgraphs/name/centrifuge/tinlake';
const graphTotalTokenTVLQuery = gql`
query GET_TOTAL_TOKEN_TVL($block: Int) {
  pools(
    first: 1000,
    block: { number: $block }
  ) {
    id
    assetValue
    reserve
  }
}
`;
const dai = "0x6b175474e89094c44da98b954eedeac495271d0f"

async function tvl(timestamp, ethBlock, chainBlocks) {
    let total = BigNumber(0)
    const { pools } = await request(
        subgraphUrl,
        graphTotalTokenTVLQuery,
        {
            block: ethBlock
        }
    );
    pools.forEach(pool=>{
        total = total.plus(pool.assetValue).plus(pool.reserve)
    })

    return {
        [dai]: total.toFixed(0)
    }
}

module.exports = {
  methodology: 'TVL consist of the sum of every pool. The pool value is made up of the NAV (the value of the assets in the pool) and the Pool Reserve (undeployed capital in the pool). The Tinlake subgraph is used to pull the assetValue and reserve values of each pool.',
  tvl
}

