const { treasuryExports } = require("../helper/treasury");

const tokens = [
  '0x136471a34f6ef19fe571effc1ca711fdb8e49f2b', // USYC
  '0x437cc33344a0B27A429f795ff6B469C72698B291',  // wM
  '0xd001f0a15D272542687b2677BA627f48A4333b5d', // USL
  '0xC139190F447e929f090Edeb554D95AbB8b18aC1C' // USDtb
]

const owners = [
  '0x81ad394C0Fa87e99Ca46E1aca093BEe020f203f4', // Yield Treasury
]

module.exports = treasuryExports({
  ethereum: {
    tokens,
    owners,
    ownTokens: ["0x06B964d96f5dCF7Eae9d7C559B09EDCe244d4B8E", "0xC4441c2BE5d8fA8126822B9929CA0b81Ea0DE38E" ], // USUALX and USUAL 
  }
})