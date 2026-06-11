const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  solana: {
    owners: ['C63SijJLVtiMmzosPmZ23mft4GxXXXTxjmuuu98owx8K'],
    tokens: [
      ADDRESSES.null, ADDRESSES.solana.USDC
    ],
  },
})