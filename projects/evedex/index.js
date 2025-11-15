'use strict';

const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

const tokens = [ADDRESSES.eventum.USDT];
const owners = [
  '0x1DC14e4261eCd7747Cbf6D2C8538a73371405D76', 
  '0x5e023c31E1d3dCd08a1B3e8c96f6EF8Aa8FcaCd1',
  '0x026968b5cED079ECCD6CC78f35a5Dfddc13F9Af8', 
  '0x0a9591c64Fd9e8C1f9A81DB1B668a5f211b5735A'
];

module.exports = {
    eventum: {
        tvl: (api) => sumTokens2({ api, tokens, owners })
    }
}