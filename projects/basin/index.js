const { getLogs2 } = require('../helper/cache/getLogs');

// Aquifer
const FACTORY = {
  ethereum: "0xba51aaaa95aeefc1292515b36d86c51dc7877773",
  arbitrum: "0xba51aaaa8c2f911ae672e783707ceb2da6e97521"
};
const BORE_WELL_ABI = "event BoreWell (address well, address implementation, address[] tokens, (address, bytes) wellFunction, (address, bytes)[] pumps, bytes wellData)";
const BORE_WELL_TOPIC = "0xff64a5823907c85a1e7c0400576024f76bd1640c74350033bd0d689f793202f2";

const startBlocks = {
  ethereum: 17977905,
  arbitrum: 261772155
}

async function tvl(api) {
  const chain = api.chain
  // Find all BoreWell events
  const boreWells = await getLogs2({
    api,
    target: FACTORY[chain],
    fromBlock: startBlocks[chain],
    eventAbi: BORE_WELL_ABI,
    topics: [BORE_WELL_TOPIC]
  })

  const wells = boreWells.map(log => log.well)
  const tokens = await api.multiCall({  abi: 'address[]:tokens', calls: wells})
  const ownerTokens = tokens.map((tokens, i) => [tokens, wells[i]]);
  return api.sumTokens({ ownerTokens });
}

module.exports = {
  methodology: "Counts the value of token reserves inside all deployed Wells.",
  start: 1692797303,
}

Object.keys(FACTORY).forEach(chain => module.exports[chain] = { tvl })
