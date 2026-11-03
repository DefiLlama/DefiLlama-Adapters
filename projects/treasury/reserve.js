const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");
const { mergeExports } = require('../helper/utils');
const { unwrapSolidlyVeNft } = require('../helper/unwrapLPs');
const reserveTreasury = "0xC6625129C9df3314a4dd604845488f4bA62F9dB8";
// base
const reserveBaseTreasury = "0x6f1D6b86d4ad705385e751e6e88b0FdFDBAdf298";
const AERO = ADDRESSES.base.AERO;
const aeroVotingEscrow = "0xebf418fe2512e7e6bd9b87a8f0f294acdc67e6b4";

module.exports = mergeExports([treasuryExports({
  ethereum: {
    tokens: [nullAddress],
    owners: [reserveTreasury],
    ownTokens: ["0x320623b8e4ff03373931769a31fc52a4e78b5d70", "0x0d86883faf4ffd7aeb116390af37746f45b6f378"],
  },
}), {
  base: {
    tvl: (api) => unwrapSolidlyVeNft({ api, baseToken: AERO, veNft: aeroVotingEscrow, owner: reserveBaseTreasury }),
  },
}])
