const abiCellarV0816 = require("./cellar-v0-8-16.json");

// type Options = {
//   cellars: string[], // list of cellar addresses
//   balances: Object, // balances object to accumulate protocol TVL
//   chainBlocks, // provided by DefiLlama SDK
// }
async function sumTvl(options) {
  const { cellars, api } = options;
  // TVL is the value of each of the Cellar's positions summed up
  const positions = await api.multiCall({  abi: abiCellarV0816.getPositions, calls: cellars})
  const ownerTokens = positions.map((position, i)=>[position, cellars[i]])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  sumTvl,
};
