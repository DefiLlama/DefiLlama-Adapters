const sdk = require("@defillama/sdk");
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

const toAmountAbi = {
  inputs: [
    { internalType: "contract IERC20", name: "token", type: "address" },
    { internalType: "uint256", name: "share", type: "uint256" },
    { internalType: "bool", name: "roundUp", type: "bool" },
  ],
  name: "toAmount",
  outputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
  stateMutability: "view",
  type: "function",
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
  query get_tokens($block: Int) {
    tokens(
      block: { number: $block },
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
  query get_pairs($block: Int) {
    kashiPairs(block: { number: $block }, first: 1000) {
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
  optimism: "https://api.thegraph.com/subgraphs/name/sushi-qa/trident-optimism",
  //kava: "https://pvt.graph.kava.io/subgraphs/name/sushi-qa/trident-kava",
  //metis: "https://andromeda.thegraph.metis.io/subgraphs/name/sushi-qa/trident-metis",
};

const tridentQuery = gql`
  query get_tokens($block: Int) {
    tokens(
      block: { number: $block },
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

async function getFuroTokens(chain, block) {
  let balances = {};
  const subgraph = furoSubgraphs[chain];

  if (!subgraph) {
    return balances;
  }

  let { tokens } = await request(subgraph, furoQuery, { block });

  const calls = tokens.map((token) => {
    return {
      params: [token.id, token.liquidityShares, false],
    };
  });
  const { output } = await sdk.api.abi.multiCall({
    target: bentoboxes[chain],
    abi: toAmountAbi,
    calls,
    chain,
  });

  output.forEach(
    ({
      output: amount,
      input: {
        params: [tokenId],
      },
    }) => {
      balances[tokenId] = BigNumber.from(amount);
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

  let { kashiPairs } = await request(subgraph, kashiQuery, { block });
  kashiPairs.map((pair) => {
    const totalAsset = BigNumber.from(pair.totalAsset.elastic);
    const totalCollateral = BigNumber.from(pair.totalCollateralShare);
    if (totalAsset.gt(0)) {
      if (!balances[pair.asset.id]) {
        balances[pair.asset.id] = totalAsset;
      } else {
        balances[pair.asset.id] = balances[pair.asset.id].add(totalAsset);
      }
    }

    if (totalCollateral.gt(0)) {
      if (!balances[pair.collateral.id]) {
        balances[pair.collateral.id] = totalCollateral;
      } else {
        balances[pair.collateral.id] = balances[pair.collateral.id] =
          balances[pair.collateral.id].add(totalCollateral);
      }
    }
  });

  const calls = Object.entries(balances).map(([id, shares]) => {
    return {
      params: [id, shares, false],
    };
  });
  const { output } = await sdk.api.abi.multiCall({
    target: bentoboxes[chain],
    abi: toAmountAbi,
    calls,
    chain,
  });

  output.forEach(
    ({
      output: amount,
      input: {
        params: [tokenId],
      },
    }) => {
      balances[tokenId] = BigNumber.from(amount);
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

  let { tokens } = await request(subgraph, tridentQuery, { block });
  tokens.map((token) => {
    balances[token.id] = BigNumber.from(token.liquidity);
  });

  return balances;
}

async function getBentoboxTokensArray(chain, block) {
  let allTokens = [];
  const subgraph = bentoSubgraphs[chain];

  if (!subgraph) {
    return tokens;
  }

  //query all tokens even if > 1000 as we can't order efficiently by $ liquidity
  let id = 0;
  while (true) {
    let { tokens } = await request(subgraph, bentoQuery, {
      id, block,
    });

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
