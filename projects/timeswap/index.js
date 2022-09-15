const sdk = require("@defillama/sdk");
const retry = require("../helper/retry");

const { request, gql } = require("graphql-request");
const { getBlock } = require("../helper/getBlock");
const { getChainTransform } = require("../helper/portedTokens");

const GRAPH_URLS = {
  polygon:
    "https://api.thegraph.com/subgraphs/name/timeswap-labs/timeswap-defi-llama",
};

function chainTvl(chain) {
  return async (timestamp, _ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks);

    const query = gql`
      {
        pairs(block: { number: ${block} }) {
          id
          asset {
            id
          }
          collateral {
            id
          }
        }
      }
    `;

    const pairs = (
      await retry(async () => request(GRAPH_URLS[chain], query))
    ).pairs.map((pair) => ({
      address: pair.id,
      asset: pair.asset.id,
      collateral: pair.collateral.id,
    }));

    const balanceCalls = [];

    for (const pair of pairs) {
      balanceCalls.push(
        {
          target: pair.asset,
          params: pair.address,
        },
        {
          target: pair.collateral,
          params: pair.address,
        }
      );
    }

    const tokenBalances = await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: balanceCalls,
      block,
      chain,
    });

    let transform = await getChainTransform(chain);
    let balances = {};

    sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transform);

    return balances;
  };
}

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: chainTvl("polygon"),
  },
};
