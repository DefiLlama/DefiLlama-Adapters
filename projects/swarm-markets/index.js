const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");

const SUBGRAPH_URL =
    "https://api.thegraph.com/subgraphs/name/protofire/swarm-markets";
const XTokenWrapperContractAddress =
    "0x2b9dc65253c035eb21778cb3898eab5a0ada0cce";

async function getTokens() {
    let tokens = [];

    const tokensQuery = gql`
      query Tokens {
        tokens(where: { symbol_not: "SPT" }) {
          id
        }
      }
    `;
    const tokensResponse = await request(SUBGRAPH_URL, tokensQuery);
    tokens = tokensResponse.tokens.map((token) => token.id);

    return tokens;
}

async function getBalances(tokens, block) {
    const balanceCalls = tokens.map((token) => ({
        target: token,
        params: XTokenWrapperContractAddress,
    }));

    const balanceResponses = (
        await sdk.api.abi.multiCall({
            block,
            calls: balanceCalls,
            abi: "erc20:balanceOf",
        })
    );

    const balances = {};
    sdk.util.sumMultiBalanceOf(balances, balanceResponses, true);
    return balances;
}

async function tvl(timestamp, block) {
    const tokens = await getTokens();
    const balances = await getBalances(tokens, block);

    return balances;
}

module.exports = {
    ethereum: {
        tvl
    }
}