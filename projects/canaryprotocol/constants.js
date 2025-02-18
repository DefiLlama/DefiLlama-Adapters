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

// TODO update vaults

const VAULTS = [
  {
    name: "Nest RWA",
    address: "0xc6580Fef7a21970625c2cCb03b45a86c9CBb8EBC",
    token: TOKENS.nRWA,
  },
  {
    name: "Nest YIELD",
    address: "0x27162A82576880048DAD8697814E1F75FE665AD5",
    token: TOKENS.nYIELD,
  },
];

module.exports = {
  TOKENS,
  VAULTS,
};
