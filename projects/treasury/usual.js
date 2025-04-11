const { treasuryExports } = require("../helper/treasury");

const tokens = [
  '0x136471a34f6ef19fe571effc1ca711fdb8e49f2b', // USYC
  '0x437cc33344a0B27A429f795ff6B469C72698B291',  // wM
  '0xd001f0a15D272542687b2677BA627f48A4333b5d', // USL
  '0xC139190F447e929f090Edeb554D95AbB8b18aC1C' // USDtb
]

const owners = [
  '0xdd82875f0840AAD58a455A70B88eEd9F59ceC7c7', // Treasury
  '0x81ad394C0Fa87e99Ca46E1aca093BEe020f203f4', // Yield Treasury
  '0x4Cbc25559DbBD1272EC5B64c7b5F48a2405e6470',  // USUALM
  '0x58073531a2809744D1bF311D30FD76B27D662abB' // USUALUSDtb
]

module.exports = treasuryExports({
  ethereum: {
    tokens,
    owners
  }
})