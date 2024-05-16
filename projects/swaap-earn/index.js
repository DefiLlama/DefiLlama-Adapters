const {request, gql} = require("graphql-request");
const configEarn = [
    {
        chain: 'arbitrum',
        subgraph: 'https://api.thegraph.com/subgraphs/name/borelien/swaap-earn-arbitrum-test',
    }
]

const query = gql`
query FundsTVL{
  funds {
    tvlTotal
    asset{
      id
      decimals
    }
    id
  }
}`

function tvlFunctionGetterEarn(chain) {
    return async function tvl(timestamp, ethBlock, chainBlocks, { api }) {


        const config = configEarn.find(c => c.chain === chain)
        const {funds} = await request(
            config.subgraph,
            query,
        )

        for (const fund of funds) {
            const asset = fund.asset.id
            const decimals = fund.asset.decimals
            const eighteenDecimalsTotalAssets = fund.tvlTotal

            const totalAssets = (
                BigInt(eighteenDecimalsTotalAssets) / BigInt(10 ** (18 - decimals))
            ).toString()
            api.add(asset, totalAssets)
        }
    }
}


module.exports = {
    start: 1713312000, //  Apr 17 2024 00:00:00 GMT+0000
    methodology: `The TVL is retrieved using TheGraph.`,
    arbitrum: {
        tvl: tvlFunctionGetterEarn('arbitrum')
    }
}

