const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { pool2 } = require("../helper/pool2");

const Contracts = {
  Pool: "0x22787c26Bb0Ab0d331Eb840ff010855a70A0DcA6",
  Chef: "0xB6a34b9C6CeeE0D821BDBD98Bc337639fdD5663b",
  Tokens: {
    ETH: ADDRESSES.base.WETH,
    cbETH: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    USDbC: ADDRESSES.base.USDbC,
    USDC: ADDRESSES.base.USDC,
  },
  XEN_ETH_LP: "0xf32fdB63d0A976Cc6ceC939f2824FCF7F9819F68",
  LOCKED_XEN_ETH_LP: "0x57A480007DFbce2803147DCcBeAFAEb50BDe64Fb",
};

async function tvl(_, _b, _cb, { api }) {
  return sumTokens2({ api, owner: Contracts.Pool, tokens: Object.values(Contracts.Tokens) });
}

module.exports = {
  base: {
    tvl,
    pool2: pool2([Contracts.Chef, Contracts.LOCKED_XEN_ETH_LP], Contracts.XEN_ETH_LP),
  },
};
