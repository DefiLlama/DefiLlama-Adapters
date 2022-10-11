const { sumTokens2 } = require('../helper/unwrapLPs')

// ztp swap address
const SWAP_ADDR = "0xCdD4396527b6681775173839002E6af201885CB8";

// stable coin address
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";

async function tvl(timestamp, ethereumBlock, { bsc: block }) {
  return sumTokens2({ chain: 'bsc', block, owner: SWAP_ADDR, tokens: [BUSD, DAI, USDC, USDT,]})
}

module.exports = {
  bsc: {
    tvl,
  },
}
