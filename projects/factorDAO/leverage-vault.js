const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");

// ████ Constants █████████████████████████████████████████████████████████

const queryBlock = gql`
  {
    leverageVaultPoolTokenStates(block: { number: $block }) {
      underlyingAssetAddress
      balanceRaw
    }
  }
`;

const queryLatest = gql`
  {
    leverageVaultPoolTokenStates {
      underlyingAssetAddress
      balanceRaw
    }
  }
`;

const SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/dimasriat/factor-leverage-vault";

// ████ Helper ████████████████████████████████████████████████████████████

async function subgraphCall(url, query, queryFail, variable) {
  let result;

  try {
    result = await request(url, query, variable);
  } catch (err) {
    result = await request(url, queryFail, variable);
  }

  return result;
}

// ████ TVL Handler ███████████████████████████████████████████████████████

async function leverageVaulTvl(timestamp, ethBlock, chainBlocks) {
  try {
    const balances = {};

    const { leverageVaultPoolTokenStates } = await subgraphCall(
      SUBGRAPH_URL,
      queryBlock,
      queryLatest,
      { block: chainBlocks["arbitrum"] }
    );

    for (let poolTokenState of leverageVaultPoolTokenStates) {
      const { underlyingAssetAddress, balanceRaw } = poolTokenState;

      sdk.util.sumSingleBalance(
        balances,
        `arbitrum:${underlyingAssetAddress}`,
        balanceRaw
      );
    }

    return balances;
  } catch (err) {
    throw err;
  }
}

// ████ Module Exports ████████████████████████████████████████████████████

module.exports = leverageVaulTvl;
