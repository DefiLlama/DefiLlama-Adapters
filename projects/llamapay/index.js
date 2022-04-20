const sdk = require("@defillama/sdk");
const { GraphQLClient, gql } = require("graphql-request");
const retry = require("../helper/retry");

const avaxEndpoint = "https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-avax-mainnet" // AVAX 

const queryField = gql`
    {
  llamaPayContracts(first:1000) {
    address
    token {
      id
    }
  }
}
`

async function getTvl(block, chain, endpoint) {
    const balances = {};
    const gqlClient = new GraphQLClient(endpoint);
    const queryResults = (await gqlClient.request(queryField, {block})).llamaPayContracts;
    const tokensAndBalances = (await sdk.api.abi.multiCall({
        calls: queryResults.map((p) => ({
            target: p.token.id,
            params: p.address
        })),
        abi: "erc20:balanceOf",
        block,
        chain
    })).output;
    ;
    tokensAndBalances.map(p => {
        if (p.output === '0') return;
        sdk.util.sumSingleBalance(balances, `${chain}:${p.input.target}`, p.output);
    })
    return balances
}

async function tvl(timestamp, block, chainBlocks) {
    block = chainBlocks.avax;
    return getTvl(block, "avax", avaxEndpoint);
}

module.exports = {
    avalanche: {
        tvl
    }
}