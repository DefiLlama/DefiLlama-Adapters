const { uniV3Export } = require('../helper/uniswapV3')

const standardExport = uniV3Export({
  jbc: { factory: '0x5835f123bDF137864263bf204Cf4450aAD1Ba3a7', fromBlock: 4990175 },
  bitkub: { factory: '0x090C6E5fF29251B1eF9EC31605Bdd13351eA316C', fromBlock: 25033350 },
})

// jbc tvl correction
const originalJbcTvl = standardExport.jbc.tvl;
standardExport.jbc.tvl = async (timestamp, block, chainBlocks, { api }) => {
  const tvl = await originalJbcTvl(timestamp, block, chainBlocks, { api });
  for (const token in tvl) {
    tvl[token] = tvl[token] * 2;
  }
  return tvl;
};

module.exports = standardExport
