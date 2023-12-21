const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

const config = {
  polygon: {
    owners: ["0x3c0d3f52e9aa1c9645a05452f45c064a0f9569bf"],
    ownTokens: ["0xdc6d1bd104e1efa4a1bf0bbcf6e0bd093614e31a"]
  },
  arbitrum: {
    owners: ["0x63464916388dab4f2e80551250335490c4518d37"],
    ownTokens: ["0xa533f744b179f2431f5395978e391107dc76e103"]
  },
  ethereum: {
    owners: ["0x893047ea492659418501e3b5868aBe75468e2EB6"],
    ownTokens: ["0xA533f744B179F2431f5395978e391107DC76e103"]
  },
}

module.exports = treasuryExports(config);