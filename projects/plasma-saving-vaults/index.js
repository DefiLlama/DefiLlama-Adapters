const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const LendingVault = "0xd1074E0AE85610dDBA0147e29eBe0D8E5873a000";

module.exports = treasuryExports({
  plasma: {
    tokens: [ 
        ADDRESSES.plasma.USDT0,
        '0x5D72a9d9A9510Cd8cBdBA12aC62593A58930a948',
     ],
    owners: [LendingVault],
  },
})