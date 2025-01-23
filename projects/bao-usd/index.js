const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ tokensAndOwners: [[ADDRESSES.ethereum.LUSD, '0x93C825F8B1F420fB07412Bc4E588b59f4f340384'], [ADDRESSES.ethereum.WETH, '0xC137fa40Ff0cb53ff157e1dCafc7262877069219']], }),
  }
};