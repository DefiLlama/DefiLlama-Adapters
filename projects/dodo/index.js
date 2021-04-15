const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');

const graphEndpoint = "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2"
const graphQuery = gql`
query get_pairs($block: Int) {
    pairs(
      block: { number: $block }
    ) {
        id
        baseReserve
        quoteReserve
        baseToken{
          id
          symbol
        }
        quoteToken{
          id
          symbol
        }
    }
}
`

async function tvl(timestamp, block) {
    const response = await request(
        graphEndpoint,
        graphQuery,
        {
            block,
        }
    );
    console.log(response.pairs)
    const balanceCalls = response.pairs.map(pair=>[{
        target: pair.quoteToken.id,
        params: [pair.id]
    },{
        target: pair.baseToken.id,
        params: [pair.id]
    }]).flat()

    const balanceResults = await sdk.api.abi.multiCall({
        abi:'erc20:balanceOf',
        calls: balanceCalls,
        block
    })
    const balances = {}
    sdk.util.sumMultiBalanceOf(balances, balanceResults)

    return balances
}

module.exports = {
    ethereum: {
        tvl,
    },
    tvl
}