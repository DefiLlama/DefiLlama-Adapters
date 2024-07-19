const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')
const TokenMerger = '0x36A06C470342Fc3443d768a9c85Aa43985D82219';

async function tvl(api) {
  const tokens = await api.call({ abi: abi.getAllFragmentedTokens, target: TokenMerger })
  return sumTokens2({ api, owner: TokenMerger, tokens, })
}

module.exports = {
  methodology: 'Counts the total balance of Fragmented tokens held in the Token Merger contract on Milkomeda C1 MACC.',
  milkomeda: {
    tvl,
  },
};

