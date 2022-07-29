const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getChainTransform } = require("../helper/portedTokens")
const { request, gql } = require("graphql-request");

const STABLE_VERSION = '0x059d306A25c4cE8D7437D25743a8B94520536BD5'
const VULN_VERSION = '0x230C63702D1B5034461ab2ca889a30E343D81349'
const BETA_VERSION = '0x24F85583FAa9F8BD0B8Aa7B1D1f4f53F0F450038'

const VERSIONS = {
  optimism: [
    { contract: STABLE_VERSION, subgraph: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-optimism' },
    { contract: VULN_VERSION, subgraph: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-vulnerable-optimism' },
    { contract: BETA_VERSION, subgraph: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-optimism-beta' },
  ],
  polygon: [ 
    { contract: STABLE_VERSION, subgraph: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-polygon' },
    { contract: VULN_VERSION, subgraph: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-vulnerable-polygon' },
  ],
  arbitrum: [
    { contract: STABLE_VERSION, subgraph: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-arbitrum' },
  ]
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
  for (const version of VERSIONS[chain]) {
    await getV2TVLForVersion(balances, chain, version, block)
  }
  return balances
}

async function getV2TVLForVersion(balances, chain, version, block) {
  const { contract, subgraph } = version
  const tokens = await getTokensInChain(subgraph)
  const chainTransform = await getChainTransform(chain)
  for (const token of tokens) {
    const balance = await sdk.api.erc20.balanceOf({
      target: token,
      owner: contract,
      block,
      chain
    })
    sdk.util.sumSingleBalance(balances, chainTransform(token), balance.output);
  }
}

//DCA Factory
const factoryAddress = "0xaC4a40a995f236E081424D966F1dFE014Fe0e98A";

//Helper for ABI calls
async function abiCall(target, abi, block) {
  let result = await sdk.api.abi.call({
    target: target,
    abi: abi,
    block: block,
  });
  return result;
}

async function ethTvl(timestamp, block) {
  const balances = {};
  //Gets all pairs
  const pairCall = await abiCall(factoryAddress, abi["allPairs"], block);

  const pairs = pairCall.output;

  //Calls for tokens in pair and balances of them then adds to balance
  for (let i = 0; i < pairs.length; i++) {
    const pool = pairs[i];
    const token1 = (await abiCall(pool, abi["tokenA"], block)).output;
    const token2 = (await abiCall(pool, abi["tokenB"], block)).output;
    const poolBalances = (await abiCall(pool, abi["availableToBorrow"], block)).output;
    const token1Balance = poolBalances[0];
    const token2Balance = poolBalances[1];
    sdk.util.sumSingleBalance(balances, token1, token1Balance);
    sdk.util.sumSingleBalance(balances, token2, token2Balance);
  }

  return balances;
}

module.exports = {
  ethereum: {
    tvl: ethTvl
  },
  optimism: getV2TvlObject('optimism'),
  polygon: getV2TvlObject('polygon'),
  arbitrum: getV2TvlObject('arbitrum'),
};
