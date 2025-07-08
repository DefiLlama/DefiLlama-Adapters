const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const acc = '0x686e5ac50D9236A9b7406791256e47feDDB26AbA';
const met = '0x2Ebd53d035150f328bd754D6DC66B99B0eDB89aa';
const proceeds = '0x68c4b7d05fae45bcb6192bb93e246c77e98360e1';

module.exports = {
  start: '2018-05-23',        // block 5659904
  hallmarks: [
    [1661257318,"Metronome V1 Sunset"]
  ],
  ethereum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [nullAddress, acc],
        [nullAddress, proceeds],
      ]
    })
  }
};
