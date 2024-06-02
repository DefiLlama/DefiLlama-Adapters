const { getLogs2 } = require('../helper/cache/getLogs');

// Aquifer
const FACTORY = "0xba51aaaa95aeefc1292515b36d86c51dc7877773";
const BORE_WELL_ABI = "event BoreWell (address well, address implementation, address[] tokens, (address, bytes) wellFunction, (address, bytes)[] pumps, bytes wellData)";

const startBlocks = {
  ethereum: 17977905
}

function chainTvl(chain) {
  return async (api) => {
    // Find all BoreWell events
    const START_BLOCK = startBlocks[chain];
    const logs = await getLogs2({
      api,
      target: FACTORY,
      fromBlock: START_BLOCK,
      eventAbi: BORE_WELL_ABI,
      topics: ['0xff64a5823907c85a1e7c0400576024f76bd1640c74350033bd0d689f793202f2'],
    });
    
    const ownerTokens = logs.map(log => [log.tokens, log.well])
    return api.sumTokens({ ownerTokens })
  }
}

module.exports = {
  methodology: "Counts the value of token reserves inside all deployed Wells.",
  start: 17977905,
  ethereum: {
    tvl: chainTvl('ethereum')
  }
};
