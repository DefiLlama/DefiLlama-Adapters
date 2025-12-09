const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const paraChef = "0x77341bF31472E9c896f36F4a448fdf573A0D9B60";
const prehackChef = '0x633fa755a83b015cccdc451f82c57ea0bd32b4b4'

module.exports = {
  bsc: {
    tvl: sumTokensExport({
      owner: paraChef,
      tokens: [
        ADDRESSES.bsc.BTCB,
        ADDRESSES.bsc.ETH,
        ADDRESSES.bsc.USDT,
        ADDRESSES.bsc.WBNB,
        ADDRESSES.bsc.BUSD,
        '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd',
        '0x965f527d9159dce6288a2219db51fc6eef120dd1',
        '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
      ]
    }),
  },
  // hallmarks: [
  //   ['2022-03-13', 'Masterchef was hacked'],
  // ],
};
