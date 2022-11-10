const { request, gql } = require("graphql-request");
const { sumTokens2 } = require('../helper/unwrapLPs');

const V2_ADDRESS = '0xb519Cf56C63F013B0320E89e1004A8DE8139dA27'; // shared by all networks

function v2(chain) {
  return async (time, ethBlock, chainBlocks) => {
    const block = chainBlocks[chain]
    const tokensApi = `https://graph-prod.klex.finance/subgraphs/name/klex-staging-2-mainnet`;
    const POOL_TOKENS = gql`
    {
      pools {
        name
        tokensList
        address
      }
    }`;

    const v2Tokens = await request(tokensApi, POOL_TOKENS, {
      block,
    });
    const tokens = [];
    const blacklist = []
    for (const { address, tokensList } of v2Tokens.pools) {
      tokens.push(...tokensList)
      blacklist.push(address)
    }
    return sumTokens2({ chain, block, owner: V2_ADDRESS, tokens, blacklistedTokens: blacklist, })
  }
}

module.exports = {
  klaytn:{
    tvl: v2("klaytn")
  },
}