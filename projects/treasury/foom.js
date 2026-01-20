const { treasuryExports } = require("../helper/treasury");
const coreAssets = require("../helper/coreAssets.json");

const FOOM_TREASURY = '0xffefa70b6deaab975ef15a6474ce9c4214d82b02';
const TOKENS = {
  STETH: coreAssets.ethereum.STETH,
  ADS: '0xcfcecfe2bd2fed07a9145222e8a7ad9cf1ccd22a',
  ETH: coreAssets.null,
  FOOM: '0xd0d56273290d339aaf1417d9bfa1bb8cfe8a0933',
  WBTC: coreAssets.ethereum.WBTC,
};

module.exports = treasuryExports({
  ethereum: {
    owners: [FOOM_TREASURY],
    ownTokens: [TOKENS.FOOM]
  },
});
