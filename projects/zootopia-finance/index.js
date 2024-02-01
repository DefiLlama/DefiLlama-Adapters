const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// ztp swap address
const SWAP_ADDR = "0xCdD4396527b6681775173839002E6af201885CB8";

// stable coin address
const BUSD = ADDRESSES.bsc.BUSD;
const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
const USDC = ADDRESSES.bsc.USDC;
const USDT = ADDRESSES.bsc.USDT;

async function tvl(timestamp, ethereumBlock, { bsc: block }) {
  return sumTokens2({ chain: 'bsc', block, owner: SWAP_ADDR, tokens: [BUSD, DAI, USDC, USDT,]})
}

module.exports = {
  hallmarks: [
    [1667174400, "Rug Pull"]
  ],
  bsc: {
    tvl,
  },
}
