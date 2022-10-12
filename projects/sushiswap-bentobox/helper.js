const { request, gql } = require("graphql-request");
const { BigNumber } = require("ethers");

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

const bentoSubgraphs = {
  ethereum:
    "https://api.thegraph.com/subgraphs/name/sushiswap/bentobox-ethereum",
  polygon: "https://api.thegraph.com/subgraphs/name/sushiswap/bentobox-polygon",
  fantom: "https://api.thegraph.com/subgraphs/name/sushiswap/bentobox-fantom",
  bsc: "https://api.thegraph.com/subgraphs/name/sushiswap/bentobox-bsc",
  avax: "https://api.thegraph.com/subgraphs/name/sushiswap/bentobox-avalanche",
  arbitrum:
    "https://api.thegraph.com/subgraphs/name/sushiswap/bentobox-arbitrum",
  optimism:
    "https://api.thegraph.com/subgraphs/name/sushiswap/bentobox-optimism",
  xdai: "https://api.thegraph.com/subgraphs/name/sushiswap/bentobox-gnosis",
  harmony: "https://api.thegraph.com/subgraphs/name/sushiswap/bentobox-harmony",
  moonbeam:
    "https://api.thegraph.com/subgraphs/name/sushiswap/bentobox-moonbeam",
  moonriver:
    "https://api.thegraph.com/subgraphs/name/sushiswap/bentobox-moonriver",
  //metis: "",
  celo: "https://api.thegraph.com/subgraphs/name/sushiswap/bentobox-celo",
  //kava: "",
};

const bentoQuery = gql`
  query get_tokens($id: ID!) {
    tokens(first: 1000, where: { id_gt: $id }) {
      id
      kpi {
        liquidity
      }
      rebase {
        elastic
        base
      }
    }
  }
`;

const furoSubgraphs = {
  ethereum:
    "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-ethereum",
  polygon:
    "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-polygon",
  fantom: "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-fantom",
  bsc: "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-bsc",
  avax: "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-avalanche",
  arbitrum:
    "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-arbitrum",
  optimism:
    "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-optimism",
  xdai: "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-gnosis",
  harmony:
    "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-harmony",
  moonbeam:
    "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-moonbeam",
  moonriver:
    "https://api.thegraph.com/subgraphs/name/sushi-subgraphs/furo-moonriver",
};

const furoQuery = gql`
  query get_tokens {
    tokens(
      orderBy: liquidityShares
      orderDirection: desc
      first: 1000
      where: { liquidityShares_gt: 0 }
    ) {
      id
      liquidityShares #shares
      symbol
      name
    }
  }
`;

const kashiSubgraphs = {
  ethereum: "https://api.thegraph.com/subgraphs/name/sushi-labs/kashi-ethereum",
  polygon: "https://api.thegraph.com/subgraphs/name/sushi-labs/kashi-polygon",
  arbitrum: "https://api.thegraph.com/subgraphs/name/sushi-labs/kashi-arbitrum",
  bsc: "https://api.thegraph.com/subgraphs/name/sushi-labs/kashi-bsc",
  avax: "https://api.thegraph.com/subgraphs/name/sushiswap/kashi-avalanche",
};

const kashiQuery = gql`
  query get_pairs {
    kashiPairs(first: 1000) {
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
  polygon: "https://api.thegraph.com/subgraphs/name/sushi-0m/trident-polygon",
  optimism: "https://api.thegraph.com/subgraphs/name/sushi-0m/trident-optimism",
  //kava: "https://pvt.graph.kava.io/subgraphs/name/sushi-0m/trident-kava",
  //metis: "https://andromeda.thegraph.metis.io/subgraphs/name/sushi-0m/trident-metis",
};

const tridentQuery = gql`
  query get_tokens {
    tokens(
      first: 1000
      orderBy: liquidityUSD
      orderDirection: desc
      where: { liquidityUSD_gt: 0 }
    ) {
      id
      symbol
      liquidity #amount
    }
  }
`;

async function getFuroTokens(chain) {
  let balances = {};
  const subgraph = furoSubgraphs[chain];

  if (!subgraph) {
    return balances;
  }

  let { tokens } = await request(subgraph, furoQuery);
  tokens.map((token) => {
    balances[token.id] = BigNumber.from(token.liquidityShares);
  });

  return balances;
}

async function getKashiTokens(chain) {
  let balances = {};
  const subgraph = kashiSubgraphs[chain];

  if (!subgraph) {
    return balances;
  }

  let { kashiPairs } = await request(subgraph, kashiQuery);
  kashiPairs.map((pair) => {
    if (!balances[pair.asset.id]) {
      balances[pair.asset.id] = BigNumber.from(pair.totalAsset.elastic);
    } else {
      balances[pair.asset.id].add(pair.totalAsset.elastic);
    }
    if (!balances[pair.collateral.id]) {
      balances[pair.collateral.id] = BigNumber.from(pair.totalCollateralShare);
    } else {
      balances[pair.collateral.id].add(pair.totalCollateralShare);
    }
  });

  return balances;
}

async function getTridentTokens(chain) {
  let balances = {};
  const subgraph = tridentSubgraphs[chain];

  if (!subgraph) {
    return balances;
  }

  let { tokens } = await request(subgraph, tridentQuery);
  tokens.map((token) => {
    balances[token.id] = BigNumber.from(token.liquidity);
  });

  return balances;
}

async function getBentoboxTokens(chain) {}

module.exports = {
  getFuroTokens,
  getKashiTokens,
  getTridentTokens,
};
