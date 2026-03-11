const ADDRESSES = require('../helper/coreAssets.json');
const { treasuryExports } = require("../helper/treasury");

const treasury = "0x80b371b774DCC34083A218b050A27724f4282D07";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
        ADDRESSES.ethereum.STETH
     ],
    owners: [treasury]
  },
})
