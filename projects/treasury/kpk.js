const ADDRESSES = require('../helper/coreAssets.json');
const { treasuryExports } = require("../helper/treasury");

const treasury = "0x58e6c7ab55Aa9012eAccA16d1ED4c15795669E1C";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
        ADDRESSES.ethereum.WEETH,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.SAFE,
        "0x4da27a545c0c5B758a6BA100e3a049001de870f5", // stkAAVE,
        "0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab", // COW
        "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72", // ENS
        ADDRESSES.ethereum.UNI,
        "0x0d438f3b5175bebc262bf23753c1e53d03432bde", // WNXM
        ADDRESSES.ethereum.LIDO,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.GNO,
        ADDRESSES.ethereum.CRVUSD,
        "0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF", // AURA
        ADDRESSES.ethereum.CVX,
        "0xd33526068d116ce69f19a9ee46f0bd304f21a51f", // RPL
        "0x39b8B6385416f4cA36a20319F70D28621895279D", // EURe
     ],
    owners: [treasury]
  },
})
