const { nullAddress, treasuryExports } = require("../helper/treasury");
const convexTreasuryVault = "0x1389388d01708118b497f59521f6943Be2541bb7";
const cvx = "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B";
const cvxCrv = "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      "0xD533a949740bb3306d119CC777fa900bA034cd52", // CRV
      "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F", // SNX
      "0x31429d1856aD1377A8A0079410B297e1a9e214c2", // ANGLE
      "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", // LDO
      "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF", // ALCX
      "0x92E187a03B6CD19CB6AF293ba17F2745Fd2357D5", // DUCK
      "0x4E15361FD6b4BB609Fa63C81A2be19d873717870", // FTM
      "0x3472A5A71965499acd81997a54BBA8D852C6E53d", // BADGER
      "0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2", // MTA
      "0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26", // OGN
      "0xCdF7028ceAB81fA0C6971208e83fa7872994beE5", // T
    ],
    owners: [convexTreasuryVault],
    ownTokens: [cvx, cvxCrv],
  },
});
