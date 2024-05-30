const { getLogs } = require('../helper/cache/getLogs');

// Aquifer
const FACTORY = "0xba51aaaa95aeefc1292515b36d86c51dc7877773";
const BORE_WELL_TOPIC = "0xff64a5823907c85a1e7c0400576024f76bd1640c74350033bd0d689f793202f2";
const BORE_WELL_ABI = "event BoreWell (address well, address implementation, address[] tokens, (address, bytes) wellFunction, (address, bytes)[] pumps, bytes wellData)";

const startBlocks = {
  ethereum: 17977905
}

function chainTvl(chain) {
  return async (api) => {
    // Find all BoreWell events
    const START_BLOCK = startBlocks[chain];
    const logs = await getLogs({
      api,
      target: FACTORY,
      fromBlock: START_BLOCK,
      topics: [BORE_WELL_TOPIC],
      eventAbi: BORE_WELL_ABI,
      skipCache: true // No results can be found without skipCache=true
    });
    
    // Extract well address + the ERC20 tokens in the pair
    const wells = logs.map(log => ({
      address: log.args.well,
      tokens: log.args.tokens
    }));
    
    // Get token reserves
    const wellReserves = await Promise.all(
      wells.map(well =>
        api.call(
          {
            abi: "function getReserves() external view returns (uint256[] reserves)",
            target: well.address
          }
        )
      )
    );

    const totalBasinReserves = {};

    // Sum of all reserves across all wells
    for (let i = 0; i < wells.length; ++i) {
      for (let j = 0; j < wells[i].tokens.length; ++j) {
        const key = `${chain}:${wells[i].tokens[j].toLowerCase()}`
        totalBasinReserves[key] = (totalBasinReserves[key] ?? 0) + wellReserves[i][j];
      }
    }
    return totalBasinReserves;
  }
}

module.exports = {
  methodology: "Counts the value of token reserves inside all deployed Wells.",
  start: 17977905,
  timetravel: true,
  ethereum: {
    tvl: chainTvl('ethereum')
  }
};
