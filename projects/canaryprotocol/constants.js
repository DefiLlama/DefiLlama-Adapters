const ADDRESSES = require('../helper/coreAssets.json');

const TOKENS = {
  nRWA: {
    name: 'Nest RWA',
    address: ADDRESSES.plume.nRWA,
    decimals: 6
  },
  nYIELD: {
    name: 'Nest Yield',
    address: ADDRESSES.plume.nYIELD,
    decimals: 6
  },
  nTBILL: {
    name: 'Nest Treasury',
    address: ADDRESSES.plume.nTBILL,
    decimals: 6
  },
  pETH: {
    name: 'Plume ETH',
    address: ADDRESSES.plume.pETH,
    decimals: 6
  },
  pUSD: {
    name: 'Plume USD',
    address: ADDRESSES.plume.pUSD,
    decimals: 18
  },
  USDT: {
    name: 'USDT',
    address: ADDRESSES.plume.USDT,
    decimals: 6
  },
};

const VAULTS = [
  {
    address: "0x799277E50cC4300C4e8822aB9E492fc0c86B8052",
    token: TOKENS.nRWA,
  },
  {
    address: "0x5Cd3A27f40E3F0E14c0C0FE4082CabCe4B28AB0F",
    token: TOKENS.nYIELD,
  },
  {
    address: "0xC32b7AF419b82E9Fb6b75F7B5b93e7A19B8d8957",
    token: TOKENS.nTBILL,
  },
  {
    address: "0x2546772FB4Fb296b07d6a1D4e862f6744F55563a",
    token: TOKENS.pETH,
  },
  {
    address: "0x9081de7F63C62aD4bfB5a8538E8b4F244CAd88E6",
    token: TOKENS.pUSD,
  },
  {
    address: "0x87B3267bA5092b703f292685348E248e033475A5",
    token: TOKENS.USDT,
  },
];

module.exports = {
  TOKENS,
  VAULTS,
};
