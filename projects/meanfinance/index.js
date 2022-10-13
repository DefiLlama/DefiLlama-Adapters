const sdk = require("@defillama/sdk");
const { V1_POOLS, TOKENS_IN_LEGACY_VERSIONS } = require("./addresses");
const { getChainTransform } = require("../helper/portedTokens")
const { request, gql } = require("graphql-request");

const YIELD_VERSION = '0xA5AdC5484f9997fBF7D405b9AA62A7d88883C345'
const YIELDLESS_VERSION = '0x059d306A25c4cE8D7437D25743a8B94520536BD5'
const VULN_VERSION = '0x230C63702D1B5034461ab2ca889a30E343D81349'
const BETA_VERSION = '0x24F85583FAa9F8BD0B8Aa7B1D1f4f53F0F450038'

const LEGACY_VERSIONS = {
  optimism: [BETA_VERSION, VULN_VERSION, YIELDLESS_VERSION],
  polygon: [VULN_VERSION, YIELDLESS_VERSION]
}

const SUBGRAPHS = {
  optimism: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-yf-optimism',
  polygon: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-yf-polygon',
}
const query = gql`
  query tokens {
    tokens (where: { id_not: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" }) {
      id
    }
  }`
;

const getTokensInChain = async (subgraph) => {
  const result = await request(subgraph, query);
  return result.tokens.map(({ id }) => id)
};

function getV2TvlObject(chain) {
  return {
    tvl: (_, __, chainBlocks) => getV2TVL(chain, chainBlocks[chain])
  }
}

async function getV2TVL(chain, block) {
  const balances = {};

  const legacyVersions = LEGACY_VERSIONS[chain] ?? []
  const legacyTokens = TOKENS_IN_LEGACY_VERSIONS[chain] ?? []
  const tokens = await getTokensInChain(SUBGRAPHS[chain])
  const versions = [
    ...legacyVersions.map(contract => ({ contract, tokens: legacyTokens })),
    { contract: YIELD_VERSION, tokens }
  ]

  const promises = versions.map(({ contract, tokens }) => getV2TVLForContract(balances, chain, contract, tokens, block))
  await Promise.all(promises)

  return balances
}

async function getV2TVLForContract(balances, chain, contract, tokens, block) {
  const chainTransform = await getChainTransform(chain)
  const balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls: tokens.map((token) => ({
        target: token,
        params: contract,
    })),
    abi: "erc20:balanceOf",
    chain,
  });

  sdk.util.sumMultiBalanceOf(balances, balanceOfResults, true, chainTransform);
}

async function ethTvl(timestamp, block) {
  const balances = {};
  // Calls for tokens in pair and balances of them then adds to balance
  for (let i = 0; i < V1_POOLS.length; i++) {
    const { pool, tokenA, tokenB } = V1_POOLS[i]
    const tokenABalance = await sdk.api.erc20.balanceOf({
      target: tokenA,
      owner: pool,
      block,
      chain: 'ethereum'
    })
    const tokenBBalance = await sdk.api.erc20.balanceOf({
      target: tokenB,
      owner: pool,
      block,
      chain: 'ethereum'
    })
    sdk.util.sumSingleBalance(balances, tokenA, tokenABalance.output);
    sdk.util.sumSingleBalance(balances, tokenB, tokenBBalance.output);
  }

  return balances;
}

module.exports = {
  ethereum: {
    tvl: ethTvl
  },
  optimism: getV2TvlObject('optimism'),
  polygon: getV2TvlObject('polygon'),
   hallmarks: [
    [1638850958, "V2 Beta launch on Optimism"],
    [1643602958, "V2 full launch"],
    [1646367758, "Deployment on Polygon"],
    [1650082958, "Protocol is paused because a non-critical vulnerability"],
    [1653366158, "V2 Relaunch"],
    [1654057358, "OP launch bring more users into Optimism and benefits Mean"]
  ]
};
