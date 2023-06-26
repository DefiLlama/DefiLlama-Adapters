const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x5A61D9214adEFD7669428a03A4e8734A00E9F464";
const treasury2 = "0x6DF5e7b236a4F14e08C27E09202B4d1865905e9b";
const vesting1 = "0x6a3CCa09b1C2B83834124c8646a68b9Bad2a07b9";
const vesting2 = "0x348aa814a72970e76d5756a2cdA16e7E8F245aAB";
const vesting3 = "0xb074094d2e858b25d129989644248f9f6946e081";
const vesting4 = "0x51d2f2c65d043118eb4329fcbc738943f494609f";
const PARA = "0xcAfE001067cDEF266AfB7Eb5A286dCFD277f3dE5";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress
     ],
    owners: [treasury, treasury2, vesting1, vesting2, vesting3, vesting4],
    ownTokens: [PARA, "0xcb0e14e96f2cefa8550ad8e4aea344f211e5061d"],
  },
  optimism: {
    tokens: [ 
        ADDRESSES.optimism.OP
     ],
    owners: ["0xb8313eaf73aed8fea1d9930df199b3c1bdb67b47"],
  },
  arbitrum: {
    tokens: [ 
        "0x912ce59144191c1204e64559fe8253a0e49e6548"
     ],
    owners: ["0xfe98240ddAEDF78E278C28F1EdD690ee1a774e66"],
  },
})