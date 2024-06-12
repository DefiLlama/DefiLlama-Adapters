const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { request, gql } = require("graphql-request");

const bentoboxes = {
  ethereum: "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966",
  polygon: "0x0319000133d3AdA02600f0875d2cf03D442C3367",
  fantom: "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966",
  bsc: "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966",
  avax: "0x0711b6026068f736bae6b213031fce978d48e026",
  arbitrum: "0x74c764D41B77DBbb4fe771daB1939B00b146894A",
  optimism: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  xdai: "0xE2d7F5dd869Fc7c126D21b13a9080e75a4bDb324",
  harmony: "0xA28cfF72b04f83A7E3f912e6ad34d5537708a2C2",
  moonbeam: "0x80C7DD17B01855a6D2347444a0FCC36136a314de",
  moonriver: "0x145d82bCa93cCa2AE057D1c6f26245d1b9522E6F",
  //metis: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  celo: "0x0711B6026068f736bae6B213031fCE978D48E026",
  //kava: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
};

const toAmountAbi =
  "function toAmount(address token, uint256 share, bool roundUp) view returns (uint256 amount)";

const bentoSubgraphs = {
  ethereum:
    `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/8HYeoDopVqqvb5RJEV2TtSzFsouYPz8cownnG3mbhiGy`,
  polygon: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/6kJg5kFoQY8B8Ge2hqswHMqZDcmsR1TLUUz7AKov69fy`,
  fantom: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/2KqXx6dGw7T4mZeGKyzQ9m9iyuCMjPR8PntLB9Gn9AEK`,
  bsc: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/BggyE3r5snDsjx19jgZcbiBH7cbtrkpjvyGLFHMdXekd`,
  avax: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/EhYaJodF1WQjKgxx1ZC63goeCwp5swD4AQRdaKXBm2xk`,
  arbitrum:
    `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/JZFyMKR4jnsFQ58q7dT6nbXenTzNgE176zTejc6Gf8Z`,
  optimism:
    `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/8b4Hy4Kn7jCNAf9JFrqHb24LsqmapG4HrAsCrwdJf9Nu`,
  xdai: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/9jn9kA6SKCNxXQSqb93zZPLdLaru4FeZBwLNWAK4nfZ2`,
  harmony: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/Bioj7N3Rf2n7iBq9PVoaMie3WiuzPze9NMi7aSye7LFc`,
  moonbeam:
    `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/7wA5gqWNP4E1dPWBsTYvz5eQSDbtYDFgyU5BGdHr2UKp`,
  moonriver:
    `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/73XEV6UQKpPSJn68WZBAYTwALcZtFJkFYn58ZoZUb7tn`,
  //metis: "",
  celo: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/5DwkvjxPGVFFaWEMM68g1yztDdhCgJEYAxS6FuhkajzR`,
  //kava: "",
};

const bentoQuery = gql`
  query get_tokens($block: Int, $id: ID!) {
    tokens(block: { number: $block }, first: 1000, where: { id_gt: $id }) {
      id
      symbol
      name
      rebase {
        elastic #amount
        base #shares
      }
    }
  }
`;

const furoSubgraphs = {
  ethereum:
    `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/D8vYJpKN5SEHUkUWKSuorsL6FRt7hAQMnywnC4e93ygf`,
  polygon:
    `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/4KsDNsyJjKX6bjwVNJQmJ7Dm3wovYXSX37UR39rNaMX4`,
  fantom: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/E98zSR5UZBGBgQe2SSLZ5R6yj5GPqKDJcQJNDHTeV3cS`,
  bsc: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/2wBYezghRA3hEJLQB4njUZGDNxCdU3u2gsLP5yVvBqKk`,
  avax: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/8LVoX3JPEVAak8T8GoEfdJudMoP2bsGwd9tszJxo3Rnx`,
  arbitrum:
    `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/8eHhPeKDr646JH5KUBBcabAJzkWmLfu6pqBtpXQHa37F`,
  optimism:
    `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/8KnsmppMf9k6Qvyixxwmny7dYugTV7XT4htHTfyq3d69`,
  xdai: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/5ToxB5xubMh9osdEDeX98JBAyzUVwkReGXAT1CzQhZCB`,
  harmony:
    `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/9D9C3ppoDE1zuZk5adznngKomLYS8NnC9zxniSS8vzgH`,
  moonbeam:
    `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/HJxpcsmaPV3L6PsqGFBHLczeMnL7bEgmL1D65edGx8pf`,
  moonriver:
    `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/9ZqdKjfu7o9dX1RThXHDV9EqMn5CTvgpsPKKbpANg8yC`,
};

const furoQuery = gql`
  query get_tokens($block: Int, $id: ID!) {
    tokens(
      block: { number: $block }
      orderBy: liquidityShares
      orderDirection: desc
      first: 1000
      where: { liquidityShares_gt: 0, id_gt: $id }
    ) {
      id
      liquidityShares #shares
      symbol
      name
    }
  }
`;

const kashiSubgraphs = {
  ethereum: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/6Kf5cPeXUMVzfGCtzBnSxDU849w2YM2o9afn1uiPpy2m`,
  polygon: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/5F3eB4Cm5mxorArsyrbs2a1TDxctmk3znpDZ4LEzqrBJ`,
  arbitrum: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/G3rbmaF7w2ZLQjZgGoi12BzPeL9z4MTW662iVyjYmtiX`,
  bsc: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/D1TGHRKx2Q54ce2goyt9hbtKNuT94FDBsuPwtGg5EzRw`,
  avax: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/BHeJByyVoNuVtqufK3Nk7YYmFkBs43boYpKv8z6hQ5Q1`,
};

const kashiQuery = gql`
  query get_pairs($block: Int, $id: ID!) {
    kashiPairs(block: { number: $block }, first: 1000, where: { id_gt: $id }) {
      id
      asset {
        id
      }
      collateral {
        id
      }
      totalAsset {
        elastic #shares
      }
      totalCollateralShare #shares
    }
  }
`;

const tridentSubgraphs = {
  polygon: "https://api.thegraph.com/subgraphs/name/sushi-v2/trident-polygon",
  optimism: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/FEgRuH9zeTRMZgpVv5YavoFEcisoK6KHk3zgQRRBqt51`,
  kava: "https://pvt.graph.kava.io/subgraphs/name/sushi-v2/trident-kava",
  metis:
    "https://andromeda.thegraph.metis.io/subgraphs/name/sushi-v2/trident-metis",
  bittorrent:
    "https://subgraphs.sushi.com/subgraphs/name/sushi-v2/trident-bttc",
  arbitrum: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/4x8H6ZoGfJykyZqAe2Kx2g5afsp17S9pn8GroRkpezhx`,
  bsc: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/9TQaBw1sU3wi2kdevuygKhfhjP3STnwBe1jUnKxmNhmn`,
  avax: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_PROTOCOL}/subgraphs/id/NNTV3MgqSGtHMBGdMVLXzzDbKDKmsY87k3PsQ2knmC1`,
};

const tridentQuery = gql`
  query get_tokens($block: Int, $id: ID!) {
    tokens(
      block: { number: $block }
      first: 1000
      orderBy: liquidityUSD
      orderDirection: desc
      where: { liquidityUSD_gt: 0, id_gt: $id }
    ) {
      id
      symbol
      liquidity #amount
    }
  }
`;

async function getFuroTokens(chain, block) {
  let balances = {};
  const subgraph = furoSubgraphs[chain];

  if (!subgraph) {
    return balances;
  }

  const tokens = await fetchAllTokens(subgraph, furoQuery, block, "furo");

  const calls = tokens.map((token) => {
    return {
      params: [token.id, sdk.util.convertToBigInt(token.liquidityShares).toString(), false],
    };
  });
  const { output } = await sdk.api.abi.multiCall({
    target: bentoboxes[chain],
    abi: toAmountAbi,
    calls,
    chain,
    block,
  });

  output.forEach(
    ({
      success,
      output: amount,
      input: {
        params: [tokenId],
      },
    }) => {
      if (success)
        sdk.util.sumSingleBalance(
          balances,
          tokenId,
          BigNumber(amount).toFixed(0)
        );
    }
  );

  return balances;
}

async function getKashiTokens(chain, block) {
  let balances = {};
  const subgraph = kashiSubgraphs[chain];

  if (!subgraph) {
    return balances;
  }

  const kashiPairs = await fetchAllTokens(subgraph, kashiQuery, block, "kashi");
  const shareBalances = {};
  kashiPairs.map((pair) => {
    if (pair.totalAsset.elastic > 0) {
      sdk.util.sumSingleBalance(
        shareBalances,
        pair.asset.id,
        BigNumber(pair.totalAsset.elastic).toFixed(0)
      );
    }

    if (pair.totalCollateralShare > 0) {
      sdk.util.sumSingleBalance(
        shareBalances,
        pair.collateral.id,
        BigNumber(pair.totalCollateralShare).toFixed(0)
      );
    }
  });

  const calls = Object.entries(shareBalances).map(([id, shares]) => {
    return {
      params: [id, sdk.util.convertToBigInt(shares).toString(), false],
    };
  });
  const { output } = await sdk.api.abi.multiCall({
    target: bentoboxes[chain],
    abi: toAmountAbi,
    calls,
    chain,
    block,
  });

  output.forEach(
    ({
      success,
      output: amount,
      input: {
        params: [tokenId],
      },
    }) => {
      if (success) sdk.util.sumSingleBalance(balances, tokenId, amount);
    }
  );

  return balances;
}

async function getTridentTokens(chain, block) {
  let balances = {};
  const subgraph = tridentSubgraphs[chain];

  if (!subgraph) {
    return balances;
  }

  const tokens = await fetchAllTokens(subgraph, tridentQuery, block, "trident");
  tokens.map((token) => {
    sdk.util.sumSingleBalance(
      balances,
      token.id,
      BigNumber(token.liquidity).toFixed(0)
    );
  });

  return balances;
}

async function getBentoboxTokensArray(chain, block) {
  const subgraph = bentoSubgraphs[chain];

  if (!subgraph) {
    return [];
  }
  return fetchAllTokens(subgraph, bentoQuery, block, "bento");
}

async function fetchAllTokens(subgraph, query, block, type) {
  let allTokens = [];

  //query all tokens even if > 1000 as we can't order efficiently by $ liquidity
  let id = 0;
  while (true) {  // eslint-disable-line
    let result = await request(subgraph, query, {
      id,
      block,
    });

    let tokens = result.tokens;
    if (type === "kashi") tokens = result.kashiPairs;

    allTokens.push(...tokens);
    if (tokens.length < 1000) {
      break;
    }
    id = tokens[999].id;
  }

  return allTokens;
}

module.exports = {
  getFuroTokens,
  getKashiTokens,
  getTridentTokens,
  getBentoboxTokensArray,
};
