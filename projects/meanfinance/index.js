const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getChainTransform } = require("../helper/portedTokens")
const { request, gql } = require("graphql-request");

const GRAPH_URLS = {
  polygon: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-polygon',
  optimism: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-optimism'
}

const DCA_HUB_ADDRESSES = {
  polygon: '0x230C63702D1B5034461ab2ca889a30E343D81349',
  optimism: '0x230C63702D1B5034461ab2ca889a30E343D81349'
}

const query = gql`
  query tokens {
    tokens {
      id
    }
  }`
;

const getTokensInChain = async (chain) => {
  const result = await request(GRAPH_URLS[chain], query);
  return result.tokens.map(({ id }) => id)
};

function getV2TvlObject(chain) {
  return {
    tvl: (_, __, chainBlocks) => getV2TVL(chain, chainBlocks[chain])
  }
}

async function getV2TVL(chain, block) {
  const balances = {};
  const tokens = await getTokensInChain(chain)
  const chainTransform = await getChainTransform(chain)
  const hubAddress = DCA_HUB_ADDRESSES[chain]
  for (const token of tokens) {
    const balance = await sdk.api.erc20.balanceOf({
      target: token,
      owner: hubAddress,
      block,
      chain
    })
    sdk.util.sumSingleBalance(balances, chainTransform(token), balance.output);
  }
  return balances
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
  polygon: getV2TvlObject('polygon')
};
