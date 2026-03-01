const { treasuryExports } = require("../helper/treasury");

// FlareBank DAO Treasury wallet
const DAO_TREASURY = "0xaa68bc4bab9a63958466f49f5a58c54a412d4906";

// Token addresses on Flare
const WFLR = "0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d";
const BANK = "0x194726F6C2aE988f1Ab5e1C943c17e591a6f6059";
const sFLR = "0x12e605bc104e93b45e1ad99f9e555f659051c2bb";
const rFLR = "0x26d460c3Cf931Fb2014FA436a49e3Af08619810e";
const FXRP = "0xAd552A648C74D49E10027AB8a618A3ad4901c5bE";
const stXRP = "0x4C18Ff3C89632c3Dd62E796c0aFA5c07c4c1B2b3";
const CDP = "0x6Cd3a5Ba46FA254D4d2E3C2B37350ae337E94a0F";
const APS = "0xff56eb5b1a7faa972291117e5e9565da29bc808d";

// LP positions held by DAO
const ENOSYS_V2_LP = "0x5F29C8d049e47DD180c2B83E3560E8e271110335";  // BANK/WFLR
const SPARKDEX_V2_LP = "0x0F574Fc895c1abF82AefF334fA9d8bA43F866111";  // BANK/WFLR

// All tokens to track in the DAO treasury (excluding own token BANK)
const treasuryTokens = [
  WFLR, sFLR, rFLR, FXRP, stXRP, CDP, APS,
  ENOSYS_V2_LP,   // V2 LP tokens held by DAO (auto-resolves underlying)
  SPARKDEX_V2_LP,  // V2 LP tokens held by DAO
];

// Own tokens (shown separately when "Include own tokens" is toggled on)
const ownTokens = [BANK];

module.exports = treasuryExports({
  flare: {
    tokens: treasuryTokens,
    owners: [DAO_TREASURY],
    ownTokens: ownTokens,
  },
});
