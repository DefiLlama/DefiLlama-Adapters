const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury = "0x2fa6F21eCfE274f594F470c376f5BDd061E08a37";

const DPX = "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55";
const RDPX = "0x32Eb7902D4134bf98A28b963D26de779AF92A212"


module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.arbitrum.USDT,
        '0x7418F5A2621E13c05d1EFBd71ec922070794b90a'
     ],
    owners: [Treasury],
    ownTokens: [DPX, RDPX],
  },
})