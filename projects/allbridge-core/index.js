const { sumTokens2 } = require("../helper/solana");

const data = require("./contracts.json");

const solanaTvl = async (api) => {
  const tokens = data['solana'].tokens;
  return sumTokens2({ tokensAndOwners: tokens.map(i => [i.tokenAddress, i.poolAddress])})
}

function getTVLFunction(chain) {
  if (chain === 'solana') return solanaTvl;

  return async function evmTvl(api) {
    const tokensData = data[chain].tokens;
    const tokensAndOwners = tokensData.map(t => [t.tokenAddress, t.poolAddress]);
    return api.sumTokens({ tokensAndOwners, })
  };
}

module.exports = {
  methodology: "All tokens locked in Allbridge Core pool contracts.",
  timetravel: false,
}

Object.keys(data).forEach(chain => {
  module.exports[chain] = {
    tvl: getTVLFunction(chain),
  }
})
