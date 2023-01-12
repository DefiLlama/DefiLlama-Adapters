const { sumTokensExport } = require("../helper/unwrapLPs");
const paraChef = "0x77341bF31472E9c896f36F4a448fdf573A0D9B60";
const prehackChef = '0x4770b5cb9d51ecb7ad5b14f0d4f2cee8e5563645'

module.exports = {
  bsc: {
    tvl: sumTokensExport({
      owner: paraChef,
      tokens: [
        '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
        '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
        '0x55d398326f99059ff775485246999027b3197955',
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        '0xe9e7cea3dedca5984780bafc599bd69add087d56',
        '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd',
        '0x965f527d9159dce6288a2219db51fc6eef120dd1',
        '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
      ]
    }),
  },
  hallmarks: [
    [Math.floor(new Date('2022-03-12')/1e3), 'Masterchef was hacked'],
  ],
};
