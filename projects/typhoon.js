const { sumTokensExport, nullAddress } = require('./helper/unwrapLPs');
const tornado = '0x9cDb933eDab885bB767658B9ED5C3800bc1d761B';
const reserve = '0xC9B4Dff1ce5384C7014579099e63EA0092e14eD5';

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ tokens: [nullAddress], owners: [tornado, reserve], })
  }
};