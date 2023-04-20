const { nullAddress, sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  methodology: 'calculate the total amount of TT locked in the veTT contract',
  thundercore: {
    tvl: sumTokensExport({ owners: ['0xC3C857a9E5Be042C8acF4F2827Aa053e93b5d039'], tokens: [nullAddress], })
  },
}