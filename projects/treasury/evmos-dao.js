const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const community_pool = "0x93354845030274cd4bf1686abd60ab28ec52e1a7";
const treasury = "0xc3c5156911bf53f12913b68e0532096536b30600";
const forge_liquidity = "0x4c3c271ca2e841c0051c0402021ddaef3ce666d0";
const forge_owner = "0x2A72df162bD5B9Ba4cBB4F28bCE590c20db7aEC1";

const tokens = [
  nullAddress,
  ADDRESSES.evmos.WEVMOS,
  ADDRESSES.evmos.STEVMOS,
  ADDRESSES.evmos.STRIDE,
  ADDRESSES.evmos.AXL_USDC
]


module.exports = treasuryExports({
  evmos: {
    tokens: tokens,
    owners: [community_pool, treasury, forge_liquidity, forge_owner],
  },
})