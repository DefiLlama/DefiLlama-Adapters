const { cachedGraphQuery } = require('../helper/cache');

////////////////////////////////////////////////////////////////////////////////

const BNBPLUS_TOKEN_CONTRACT_ADDRESS_BSC = "0x5D5721Bf35BDfFBa64E7b8fCeeb4712904a0DD11";

const SUBGRAPH_URL = "https://lorenzo-api.lorenzo-protocol.xyz/v1/graphql/otf";

////////////////////////////////////////////////////////////////////////////////

const config = {
  bsc: {
    contractAddr: BNBPLUS_TOKEN_CONTRACT_ADDRESS_BSC,
    query: `
      {
        tvlByChain(targetChainName: "bnb", valueBase: BNB, tokenName: "BNB+") {
          targetChainName
          tokenName
          tvl
          readableTvl
        }
      }
    `,
  },
};

// bnbp to bnb
const TOKEN_MAPPINGS = {
  [BNBPLUS_TOKEN_CONTRACT_ADDRESS_BSC]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
}

////////////////////////////////////////////////////////////////////////////////

/**
  * @param {import('@defillama/sdk').ChainApi} api - DefiLlama Chain API instance
  * @returns {Promise<import('@defillama/sdk').BalancesV1>} - The balances object containing token balances
  */
async function tvl(api) {
  const chain = api.chain;
  const { contractAddr, query } = config[chain];

  const data = await cachedGraphQuery(`lorenzo-protocol-bnbplus/${chain}`, SUBGRAPH_URL, query);
  const tvlValue = data?.tvlByChain?.tvl;

  if (tvlValue) {
    const targetToken = TOKEN_MAPPINGS[contractAddr] || contractAddr;
    api.add(targetToken, tvlValue);
  }
}

////////////////////////////////////////////////////////////////////////////////

module.exports = {
  methodology: "Lorenzo BNB+ is a vault that represents tokenized real-world assets. The protocol maintains a Net Asset Value (NAV) that reflects the current value of the underlying asset portfolio per token.",
  bsc: {
    tvl,
  }
};
