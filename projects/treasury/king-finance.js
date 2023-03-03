const { nullAddress, treasuryExports } = require("../helper/treasury");

const TREASURY1 = '0x2eecdb4631c3d2f49d56b4cbfede4c7b23151337'
const TREASURY2 = '0x0af6fef0248d666f0bfd73e65485186526411337'
const TREASURY3 = '0x74f08aF7528Ffb751e3A435ddD779b5C4565e684'
const TREASURY4 = '0xa6449e07ee26d552bc7a2656038cd19b1b691337'

module.exports = treasuryExports({
  bsc: {
    tokens: [
      nullAddress,
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      '0x55d398326f99059fF775485246999027B3197955',
    ],
    owners: [TREASURY1, TREASURY2, TREASURY3, TREASURY4,],
    ownTokens: ['0x74f08aF7528Ffb751e3A435ddD779b5C4565e684'],
  },
})