const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');
const { deadFrom } = require('../mosquitos-finance');

// polyo Asset Address
const Asset_P01_BUSD = "0xC72e6f8041183EaD6f85839bD463F7aD0f14A40D";
const Asset_P01_DAI = "0x6A3b82C362f4837c3A788f909197d4D461316684";
const Asset_P01_USDC = "0x17B308e859FD8ccC3D27EC290Fe5220c01188E52";
const Asset_P01_USDT = "0x2d7FA7402569e061A2218dc4e7Ac79281a8C4fB5";

// underlyingToken Address
const BUSD = ADDRESSES.bsc.BUSD;
const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
const USDC = ADDRESSES.bsc.USDC;
const USDT = ADDRESSES.bsc.USDT;

async function tvl(timestamp, ethereumBlock, chainBlocks) {
  const chain = 'bsc'
  const block = chainBlocks["bsc"];
  return sumTokens2({ chain, block, tokensAndOwners: [
    [BUSD, Asset_P01_BUSD],
    [DAI, Asset_P01_DAI],
    [USDC, Asset_P01_USDC],
    [USDT, Asset_P01_USDT],
  ]})
}

module.exports = {
  bsc: {
    // tvl,
    tvl: () => ({}),
  },
  hallmarks: [
    [1662842254, "Rug pull"],
  ],
  deadFrom: 1662842254
};
