const ADDRESSES = require('../helper/coreAssets.json');

const TOKENS = {
  nRWA: {
    name: 'Nest RWA',
    address: ADDRESSES.plume.nRWA,
    decimals: 6
  },
  nYIELD: {
    name: 'Nest YIELD',
    address: ADDRESSES.plume.nYIELD,
    decimals: 6
  },
};

const VAULTS = [
  {
    name: "USDC Basis (Perps Basket)",
    address: "4cvgasNfbJ36yeMVJSkscgL2Yco9dFGdj52Wrg91fmHv",
    token: TOKENS.USDC,
    dataUrl: `${DATA_URL}/btcethfunding.json`
  },
  {
    name: "BTC Super Staking",
    address: "BVddkVtFJLCihbVrtLo8e3iEd9NftuLunaznAxFFW8vf",
    token: TOKENS.WBTC,
    dataUrl: `${DATA_URL}/btcjlpnl.json`
  },
];

module.exports = {
  TOKENS,
  VAULTS,
};
