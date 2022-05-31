const { request, gql } = require("graphql-request");

const graphUrl = "https://api.thegraph.com/subgraphs/name/phuture-finance/phuture-v1";
const graphQuery = gql`
  query GetVaultReserves($block: Int) {
    vTokens(block: { number: $block }) {
      asset {
        id
      }
      assetReserve
    }
  }
`;

const tvl = (chain) => async (timestamp, block, chainBlocks) => {
  const { vTokens } = await request(graphUrl, graphQuery, {
    block: chainBlocks[chain]
  });

  return Object.fromEntries(vTokens
    .filter(({ assetReserve }) => assetReserve !== "0")
    .map(({ asset, assetReserve }) => [asset.id, assetReserve])
  );
};

module.exports = {
  methodology: "TVL considers tokens deposited to Phuture Indices",
  ethereum: {
    tvl: tvl("ethereum")
  }
};
