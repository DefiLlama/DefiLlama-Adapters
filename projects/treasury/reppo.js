const ADDRESSES = require('../helper/coreAssets.json');
const { treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  base: {
    tokens: [
        ADDRESSES.null,
        ADDRESSES.base.cbBTC
     ],
    owners: ['0x5996b5c566680c0257a9b683807813dea98cf39e'],
    ownTokens: ["0xFf8104251E7761163faC3211eF5583FB3F8583d6"], 
  },
})
