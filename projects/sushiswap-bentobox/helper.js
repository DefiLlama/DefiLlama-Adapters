const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");

const CONFIG = {
  ethereum: {
    bentobox: "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966",
    bento: sdk.graph.modifyEndpoint('8HYeoDopVqqvb5RJEV2TtSzFsouYPz8cownnG3mbhiGy'),
    furo: sdk.graph.modifyEndpoint('D8vYJpKN5SEHUkUWKSuorsL6FRt7hAQMnywnC4e93ygf'),
    kashi: sdk.graph.modifyEndpoint('6Kf5cPeXUMVzfGCtzBnSxDU849w2YM2o9afn1uiPpy2m'),
  },
  polygon: {
    bentobox: "0x0319000133d3AdA02600f0875d2cf03D442C3367",
    bento: sdk.graph.modifyEndpoint('6kJg5kFoQY8B8Ge2hqswHMqZDcmsR1TLUUz7AKov69fy'),
    furo: sdk.graph.modifyEndpoint('4KsDNsyJjKX6bjwVNJQmJ7Dm3wovYXSX37UR39rNaMX4'),
    kashi: sdk.graph.modifyEndpoint('5F3eB4Cm5mxorArsyrbs2a1TDxctmk3znpDZ4LEzqrBJ'),
    trident: sdk.graph.modifyEndpoint('BSdbRfU6PjWSdKjhpfUQ6EgUpzMxgpf5c1ugaVwBJFsQ'),
  },
  fantom: {
    bentobox: "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966",
    bento: sdk.graph.modifyEndpoint('2KqXx6dGw7T4mZeGKyzQ9m9iyuCMjPR8PntLB9Gn9AEK'),
    furo: sdk.graph.modifyEndpoint('E98zSR5UZBGBgQe2SSLZ5R6yj5GPqKDJcQJNDHTeV3cS'),
  },
  bsc: {
    bentobox: "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966",
    bento: sdk.graph.modifyEndpoint('BggyE3r5snDsjx19jgZcbiBH7cbtrkpjvyGLFHMdXekd'),
    furo: sdk.graph.modifyEndpoint('2wBYezghRA3hEJLQB4njUZGDNxCdU3u2gsLP5yVvBqKk'),
    kashi: sdk.graph.modifyEndpoint('D1TGHRKx2Q54ce2goyt9hbtKNuT94FDBsuPwtGg5EzRw'),
    trident: sdk.graph.modifyEndpoint('9TQaBw1sU3wi2kdevuygKhfhjP3STnwBe1jUnKxmNhmn'),
  },
  avax: {
    bentobox: "0x0711b6026068f736bae6b213031fce978d48e026",
    bento: sdk.graph.modifyEndpoint('EhYaJodF1WQjKgxx1ZC63goeCwp5swD4AQRdaKXBm2xk'),
    furo: sdk.graph.modifyEndpoint('8LVoX3JPEVAak8T8GoEfdJudMoP2bsGwd9tszJxo3Rnx'),
    kashi: sdk.graph.modifyEndpoint('BHeJByyVoNuVtqufK3Nk7YYmFkBs43boYpKv8z6hQ5Q1'),
    trident: sdk.graph.modifyEndpoint('NNTV3MgqSGtHMBGdMVLXzzDbKDKmsY87k3PsQ2knmC1'),
  },
  arbitrum: {
    bentobox: "0x74c764D41B77DBbb4fe771daB1939B00b146894A",
    bento: sdk.graph.modifyEndpoint('JZFyMKR4jnsFQ58q7dT6nbXenTzNgE176zTejc6Gf8Z'),
    furo: sdk.graph.modifyEndpoint('8eHhPeKDr646JH5KUBBcabAJzkWmLfu6pqBtpXQHa37F'),
    kashi: sdk.graph.modifyEndpoint('G3rbmaF7w2ZLQjZgGoi12BzPeL9z4MTW662iVyjYmtiX'),
    trident: sdk.graph.modifyEndpoint('4x8H6ZoGfJykyZqAe2Kx2g5afsp17S9pn8GroRkpezhx'),
  },
  optimism: {
    bentobox: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    bento: sdk.graph.modifyEndpoint('8b4Hy4Kn7jCNAf9JFrqHb24LsqmapG4HrAsCrwdJf9Nu'),
    furo: sdk.graph.modifyEndpoint('8KnsmppMf9k6Qvyixxwmny7dYugTV7XT4htHTfyq3d69'),
    trident: sdk.graph.modifyEndpoint('FEgRuH9zeTRMZgpVv5YavoFEcisoK6KHk3zgQRRBqt51'),
  },
  xdai: {
    bentobox: "0xE2d7F5dd869Fc7c126D21b13a9080e75a4bDb324",
    bento: sdk.graph.modifyEndpoint('9jn9kA6SKCNxXQSqb93zZPLdLaru4FeZBwLNWAK4nfZ2'),
    furo: sdk.graph.modifyEndpoint('5ToxB5xubMh9osdEDeX98JBAyzUVwkReGXAT1CzQhZCB'),
  },
  harmony: {
    bentobox: "0xA28cfF72b04f83A7E3f912e6ad34d5537708a2C2",
    bento: sdk.graph.modifyEndpoint('Bioj7N3Rf2n7iBq9PVoaMie3WiuzPze9NMi7aSye7LFc'),
    furo: sdk.graph.modifyEndpoint('9D9C3ppoDE1zuZk5adznngKomLYS8NnC9zxniSS8vzgH'),
  },
  moonbeam: {
    bentobox: "0x80C7DD17B01855a6D2347444a0FCC36136a314de",
    bento: sdk.graph.modifyEndpoint('7wA5gqWNP4E1dPWBsTYvz5eQSDbtYDFgyU5BGdHr2UKp'),
    furo: sdk.graph.modifyEndpoint('HJxpcsmaPV3L6PsqGFBHLczeMnL7bEgmL1D65edGx8pf'),
  },
  moonriver: {
    bentobox: "0x145d82bCa93cCa2AE057D1c6f26245d1b9522E6F",
    bento: sdk.graph.modifyEndpoint('73XEV6UQKpPSJn68WZBAYTwALcZtFJkFYn58ZoZUb7tn'),
    furo: sdk.graph.modifyEndpoint('9ZqdKjfu7o9dX1RThXHDV9EqMn5CTvgpsPKKbpANg8yC'),
  },
  celo: {
    bentobox: "0x0711B6026068f736bae6B213031fCE978D48E026",
    bento: sdk.graph.modifyEndpoint('5DwkvjxPGVFFaWEMM68g1yztDdhCgJEYAxS6FuhkajzR'),
  },
  kava: {
    trident: "https://pvt.graph.kava.io/subgraphs/name/sushi-v2/trident-kava",
  },
  metis: {
    trident: "https://andromeda.thegraph.metis.io/subgraphs/name/sushi-v2/trident-metis",
  },
  bittorrent: {
    trident: "https://subgraphs.sushi.com/subgraphs/name/sushi-v2/trident-bttc",
  },
};

const QUERIES = {
  bento: gql`
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
  `,
  furo: gql`
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
  `,
  kashi: gql`
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
  `,
  trident: gql`
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
  `,
};

const META_QUERY = gql`
  query {
    _meta {
      block {
        number
      }
    }
  }
`;

async function getLatestIndexedBlock(subgraph) {
  const res = await request(subgraph, META_QUERY);
  return res?._meta?.block?.number ?? 0;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry(fn, retries = 3, delay = 60_000) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    const result = await fn().catch(e => {
      lastError = e;
      return null;
    });
    if (result !== null) return result;
    if (i < retries - 1) await sleep(delay);
  }
  throw lastError;
}

async function getTokens(api, block, protocolType) {
  const subgraph = CONFIG[api.chain]?.[protocolType];
  if (!subgraph) return protocolType === 'bento' ? [] : {};

  const latest = await getLatestIndexedBlock(subgraph);
  const maxAllowedDrift = 1000;

  if (latest === 0 || latest < block - maxAllowedDrift) {
    sdk.log(`[${api.chain}-${protocolType}] Subgraph too far behind (${latest} vs expected ${block}) → skipping`);
    return protocolType === 'bento' ? [] : {};
  }

  const safeBlock = latest >= block ? block : latest;

  return await withRetry(() => fetchAllTokens(subgraph, QUERIES[protocolType], safeBlock, protocolType));
}

async function fetchAllTokens(subgraph, query, block, type) {
  let lastId = 0;
  const allTokens = [];
  const isKashi = type === 'kashi';
  const key = isKashi ? 'kashiPairs' : 'tokens';

  while (true) {
    const result = await request(subgraph, query, { id: lastId, block });
    const tokens = result[key] || [];
    allTokens.push(...tokens);
    if (tokens.length < 1000) break;
    lastId = tokens[999].id;
  }

  return allTokens;
}

module.exports = { CONFIG, getTokens, fetchAllTokens };
