const ADDRESSES = require('../helper/coreAssets.json');
const { nullAddress, treasuryExports } = require("../helper/treasury");

// Treasury addresses
const beraBuzzTreasury = "0x47F99545c1Baf07C4670c6Ba9A71c145448BF158";
const honeypotFinanceTreasury = "0x166a064C9D0E243fea5d9afA3E7B06a8b94E05F9";
const berapumpTreasury = "0xC44590CA8976dAcb7f2EC906258765b6317b53d0";

// Voting contracts (no TVL, but included for completeness)
const beravoteQs = "0x06Ac2CF2c6Af6D3837a506639B16ce9d30E1388B";
const votemarketQs = "0x3980F7b021624A4Cd9f67601de8f29F571c83289";

module.exports = treasuryExports({
  berachain: {
    tokens: [
      nullAddress, // Native token
      ADDRESSES.berachain.HONEY, 
      ADDRESSES.berachain.WBERA,
    ],
    owners: [
      beraBuzzTreasury,
      honeypotFinanceTreasury,
      berapumpTreasury
    ],
    ownTokens: [], 
  },
});