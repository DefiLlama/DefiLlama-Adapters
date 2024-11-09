const ADDRESSES = require('./helper/coreAssets.json')
const { pool2 } = require("./helper/pool2");
const { staking } = require("./helper/staking");
const { sumTokens2 } = require("./helper/unwrapLPs");

const tokens = {
  polygon: {
    DAI: ADDRESSES.polygon.DAI,
    USDC: ADDRESSES.polygon.USDC_CIRCLE,
    WETH: ADDRESSES.polygon.WETH_1
  },
  arbitrum: {
    DAI: ADDRESSES.arbitrum.DAI,
    USDC: ADDRESSES.arbitrum.USDC_CIRCLE,
    WETH: ADDRESSES.arbitrum.WETH
  },
  base: {
    USDC: ADDRESSES.base.USDC,
  },
};

async function polyTvl(api) {
  const tokensAndOwners = [
    [tokens.polygon.DAI, "0x91993f2101cc758D0dEB7279d41e880F7dEFe827"],  // gDAI
    [tokens.polygon.USDC, "0x29019Fe2e72E8d4D2118E8D0318BeF389ffe2C81"], // gUSDC
    [tokens.polygon.WETH, "0x1544E1fF1a6f6Bdbfb901622C12bb352a43464Fb"], // gETH
    [tokens.polygon.DAI, "0x209A9A01980377916851af2cA075C2b170452018"],  // Diamond
    [tokens.polygon.WETH, "0x209A9A01980377916851af2cA075C2b170452018"], // Diamond
    [tokens.polygon.USDC, "0x209A9A01980377916851af2cA075C2b170452018"], // Diamond
  ];
  return sumTokens2({ api, tokensAndOwners });
}
async function arbiTvl(api) {
  const tokensAndOwners = [
    [tokens.arbitrum.DAI, "0xd85E038593d7A098614721EaE955EC2022B9B91B"],  // gDAI
    [tokens.arbitrum.USDC, "0xd3443ee1e91aF28e5FB858Fbd0D72A63bA8046E0"], // gUSDC
    [tokens.arbitrum.WETH, "0x5977A9682D7AF81D347CFc338c61692163a2784C"], // gETH
    [tokens.arbitrum.DAI, "0xFF162c694eAA571f685030649814282eA457f169"],  // Diamond
    [tokens.arbitrum.USDC, "0xFF162c694eAA571f685030649814282eA457f169"], // Diamond
    [tokens.arbitrum.WETH, "0xFF162c694eAA571f685030649814282eA457f169"], // Diamond
  ];
  return sumTokens2({ api, tokensAndOwners });
}
async function baseTvl(api) {
  const tokensAndOwners = [
    [tokens.base.USDC, "0xad20523A7dC37bAbc1CC74897E4977232b3D02e5"], // gUSDC
    [tokens.base.USDC, "0x6cD5aC19a07518A8092eEFfDA4f1174C72704eeb"], // Diamond
  ];
  return sumTokens2({ api, tokensAndOwners });
}
// node test.js projects/gainsNetwork.js
module.exports = {
  hallmarks: [
    [1672531200,"Launch on Arbitrum"],
    [1705553229,"Launched gETH and gUSDC"],
    [1727650801,"Launch on Base"],
  ],
  polygon: {
    tvl: polyTvl,
    pool2: pool2(
      "0x33025b177A35F6275b78f9c25684273fc24B4e43",
      "0x6e53cb6942e518376e9e763554db1a45ddcd25c4",
      "polygon",
    ),
    staking: staking('0xfb06a737f549eb2512eb6082a808fc7f16c0819d', '0xE5417Af564e4bFDA1c483642db72007871397896'),
  },
  arbitrum: {
    tvl: arbiTvl,
    staking: staking(['0x6b8d3c08072a020ac065c467ce922e3a36d3f9d6', '0x7edDE7e5900633F698EaB0Dbc97DE640fC5dC015'], '0x18c11fd286c5ec11c3b683caa813b77f5163a122'),
  },
  base: {
    tvl: baseTvl,
    staking: staking(['0x28efAa11199DAF45AA8fBf95f920e5bc090DCbF3'], '0xFB1Aaba03c31EA98A3eEC7591808AcB1947ee7Ac'),
  },
};
