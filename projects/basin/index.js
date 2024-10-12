const { getLogs2 } = require('../helper/cache/getLogs');

// Aquifer
const FACTORY = {
  ethereum: "0xba51aaaa95aeefc1292515b36d86c51dc7877773",
  arbitrum: "0xba51aaaa8c2f911ae672e783707ceb2da6e97521"
};
const BORE_WELL_ABI = "event BoreWell (address well, address implementation, address[] tokens, (address, bytes) wellFunction, (address, bytes)[] pumps, bytes wellData)";
const BORE_WELL_TOPIC = "0xff64a5823907c85a1e7c0400576024f76bd1640c74350033bd0d689f793202f2";

// Upgradeable wells
const UPGRADED_ABI = "event Upgraded (address implementation)"
const UPGRADED_TOPIC = "0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b";

const startBlocks = {
  ethereum: 17977905,
  arbitrum: 261772155
}

function chainTvl(chain) {
  return async (api) => {
    
    // Find all BoreWell events
    const boreWells = await getLogs2({
      api,
      target: FACTORY[chain],
      fromBlock: startBlocks[chain],
      eventAbi: BORE_WELL_ABI,
      topics: [BORE_WELL_TOPIC]
    });

    const wellTokens = boreWells.reduce((acc, next) => {
      acc[next[0].toLowerCase()] = next[2];
      return acc;
    }, {});

    if (chain === 'arbitrum') {
      // Find upgradeable wells. getLogs2 does not support unknown target
      const upgradedLogs = await api.provider.getLogs({
        fromBlock: startBlocks[chain],
        toBlock: 'latest',
        topics: [
          UPGRADED_TOPIC,
          // Search where topic1 is any of the bored well addresses
          boreWells.map(log => '0x' + log.well.toLowerCase().replace(/^0x/, '').padStart(64, '0'))
        ]
      });
      // Replace the well address
      for (const upgraded of upgradedLogs) {
        const boredWell = '0x' + upgraded.topics[1].slice(26);
        wellTokens[upgraded.address] = wellTokens[boredWell];
        delete wellTokens[boredWell];
      }
    }
    
    // [[token0, token1], wellAddress]
    const ownerTokens = Object.keys(wellTokens).map(well => [wellTokens[well], well]);
    return api.sumTokens({ ownerTokens });
  }
}

module.exports = {
  methodology: "Counts the value of token reserves inside all deployed Wells.",
  start: 1692797303,
  ethereum: {
    tvl: chainTvl('ethereum')
  },
  arbitrum: {
    tvl: chainTvl('arbitrum')
  }
};
