const ADDRESSES = require("../helper/coreAssets.json");

const wbtc = ADDRESSES.bsquared.WBTC;
const usdt = ADDRESSES.bsquared.USDT;
const usdc = ADDRESSES.bsquared.USDC;
const matic = ADDRESSES.bsquared.MATIC;
const fdusd = ADDRESSES.bsquared.FDUSD;
const bstone = ADDRESSES.bsquared.BSTONE;
const ordi = ADDRESSES.bsquared.ORDI;
const sats = ADDRESSES.bsquared.SATS;
const ubtc = ADDRESSES.bsquared.UBTC;
const weth = ADDRESSES.bsquared.ETH;

const CAPY_STAKING_CONTRACT = "0x67D171A673FfDBd5BBce01dE1489f9E57F3d911b";
const CAPY_RESTAKING_CONTRACT = "0x12178d2B86031dD293274A0E25c8908521F3d27C";

const tokensInCapyStaking = [
  wbtc,
  usdt,
  usdc,
  matic,
  fdusd,
  bstone,
  ordi,
  sats,
  ubtc,
  weth,
];

const tokensInCapyReStaking = [wbtc, usdt, usdc, fdusd, weth];

async function tvl(api) {
  const balances = {};

  for (const token of tokensInCapyStaking) {
    const balance = await api.call({
      abi: "erc20:balanceOf",
      target: token,
      params: [CAPY_STAKING_CONTRACT],
    });

    api.add(token, balance);
  }

  for (const token of tokensInCapyReStaking) {
    const balance = await api.call({
      abi: "erc20:balanceOf",
      target: token,
      params: [CAPY_RESTAKING_CONTRACT],
    });

    api.add(token, balance);
  }
}

module.exports = {
  methodology: "Counts the number of tokens in the Capy Finance in USD.",
  start: 1000235,
  bsquared: {
    tvl,
  },
};

