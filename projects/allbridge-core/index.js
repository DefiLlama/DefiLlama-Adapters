const solana = require("../helper/solana");
const stellar = require("./stellar/stellar");
const data = require("./contracts.json");
const sdk = require("@defillama/sdk");
const {default: BigNumber} = require("bignumber.js");

const toNumber = (decimals, n) => BigNumber(n/(10 ** decimals)).toFixed(0)

const solanaTvl = async (api) => {
  const tokens = data['solana'].tokens;
  return solana.sumTokens2({ tokensAndOwners: tokens.map(i => [i.tokenAddress, i.poolAddress])});
}

const stellarTvl = async (api) => {
  const balances = {}
  for (const token of data['stellar'].tokens) {
    const balance = await stellar.getTokenBalance(token.tokenAddress, token.poolAddress);
    sdk.util.sumSingleBalance(balances, token.name, toNumber(token.decimals, balance));
  }
  return balances;
}

function getTVLFunction(chain) {
  if (chain === 'solana') return solanaTvl;
  if (chain === 'stellar') return stellarTvl;

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
