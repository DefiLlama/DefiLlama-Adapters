const { nullAddress, treasuryExports } = require("../helper/treasury");
const { mergeExports } = require('../helper/utils');
const reserveTreasury = "0xC6625129C9df3314a4dd604845488f4bA62F9dB8";
// base
const reserveBaseTreasury = "0x6f1D6b86d4ad705385e751e6e88b0FdFDBAdf298";
const AERO = "0x940181a94A35A4569E4529A3CDfB74e38FD98631";
const aeroVotingEscrow = "0xebf418fe2512e7e6bd9b87a8f0f294acdc67e6b4";
const veAEROIds = ["11380", "15026", "19853"];

module.exports = mergeExports([treasuryExports({
  ethereum: {
    tokens: [nullAddress],
    owners: [reserveTreasury],
    ownTokens: ["0x320623b8e4ff03373931769a31fc52a4e78b5d70"],
  },
}), {
  base: {
    tvl: async (api) => {
      const veAEROHolders = await api.multiCall({
        abi: "function ownerOf(uint256) external view returns (address)",
        calls: veAEROIds.map(veAEROId => ({ target: aeroVotingEscrow, params: veAEROId})),
        permitFailure: true,
      });      
      const ownsOfNFT = (address) => address === reserveBaseTreasury;
      const baseTreasuryIsOwner = veAEROHolders.some(ownsOfNFT);
      if(!baseTreasuryIsOwner) throw new Error("Not a valid treasury for veAERO");
      const lockedAmounts = await api.multiCall({
        abi: "function balanceOfNFT(uint256) external view returns (uint256)",
        calls: veAEROIds.map(veAEROId => ({ target: aeroVotingEscrow, params: veAEROId})),
        permitFailure: true,
      });
      api.add(AERO, lockedAmounts);
      return api.getBalances();
    },
  },
}])