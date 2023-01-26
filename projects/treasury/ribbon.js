const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');

// Treasury
const treasury = "0xDAEada3d210D2f45874724BeEa03C7d4BBD41674";

// Ethereum Assets
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const wbtc = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const aave = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9";
const bal = "0xba100000625a3754423978a60c9317c58a424e3D";
const reth = "0xae78736Cd615f374D3085123A210448E74Fc6393";
const wsteth = "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0";
const ldo = "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32";
const rbnWeth = "0xdb44a4a457c87225b5ba45f27b7828a4cc03c112";

async function getTreasury(timestamp, block, chainBlocks) {
  return sumTokens2({
    block, owner: treasury,
    tokens: [ weth, wsteth, wbtc, usdc, aave, ldo, reth, bal, rbnWeth, nullAddress],
  })
}

module.exports = {
  ethereum: {
    tvl: getTreasury,
  },
};
