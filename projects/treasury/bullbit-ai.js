const ADDRESSES = require('../helper/coreAssets.json');
const { treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  base: {
    owners: ["0x58F7260aD7C9ea00be5DB87259D572470E8f9244","0xc1dc6D5FD4980170BF871Cc0539C2cAf8035C7C4"],
    tokens: [ADDRESSES.base.USDC],
  },
})
