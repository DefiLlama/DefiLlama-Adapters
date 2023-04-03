const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');
const { chainAddresses } = require('./constants');

const getTVLFunction = (chain) => async (_timestamp, _block, chainBlocks) => {
  const contracts = Object.keys(chainAddresses[chain]);
  // tokens by chain must be unique
  return contracts.reduce(async (balances, contract) => {
    const tokens = chainAddresses[chain][contract];
    return { ...(await balances), ...(await sumTokens2({ chain, block: chainBlocks[chain], tokens, owner: contract })) };
  }, {});
};

module.exports = {
  methodology: "All tokens locked in Bridge contracts by PepeTeam.",
  timetravel: false,
};

Object.keys(chainAddresses).forEach(chain => {
  module.exports[chain] = {
    tvl: getTVLFunction(chain),
  }
})
