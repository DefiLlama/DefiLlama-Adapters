const strategy_abi = require("./strategy-abi.json");

// Bril stratagies for PancakeSwap Position Manager
const strategies = [
  '0xb3842f8038f2f7c1a83B6529308da8fdc0E53019',
  '0xafdC0eA6d2995B37B055712ce9875Ae9ED4fec27',
  '0xB7fc5C8D8318ABAd47D2F4d74895ae52f5765e7f',
  '0xBcB0DAf89999C135E6B0570c9B99ddf8De0b77c0',
  '0xccD9Af42f84B05aBE3DB79D0Ea33BF67643b1926',
  '0xde60E440775B5Dd427c4f2BF1f2FBd9A14130A14',
  '0x06d473e85110548e73caAfbED28d616EF8fa1011',
  '0x864D323eE8FB2a491d425e12Aa49288c2D33Dd15',
] 

async function tvl(_, _1, _2, { api }) {
  const balances = await api.multiCall({
    abi: strategy_abi.vaultAmounts,
    calls: strategies,
    params: [],
  });

  const summaries = await api.multiCall({
    abi: strategy_abi.vaultSummary,
    calls: strategies,
    params: [],
  });

  for (i=0; i <balances.length; i++){
    api.add(summaries[i].baseToken_, balances[i].baseTotal_);
    api.add(summaries[i].scarceToken_, balances[i].scarceTotal_);
  }

}
  
module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Count tokens managed by Bril automated liquidity management stratagies',
  start: 30131926,
  bsc: {
    tvl,
  }
}; 
// node test.js projects/bril-finance/index.js