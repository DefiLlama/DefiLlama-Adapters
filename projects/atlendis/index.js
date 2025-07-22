const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  polygon: {
    tvl: sumTokensExport({ owners: ['0xbc13e1B5DA083b10622Ff5B52c9cFa1912F10B1F', '0x2fA375961A0cB525dB0f00af4E081a806A8639Fd'], tokens: [
      '0x60D55F02A771d515e077c9C2403a1ef324885CeC',
      '0x1a13f4ca1d028320a707d99520abfefca3998b7f',
      '0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4',
    ], }),
    borrowed: () => ({}),
  }
};