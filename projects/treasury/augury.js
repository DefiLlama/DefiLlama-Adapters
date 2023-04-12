const DeveloperTeamWallet = "0xE2E26BAc2ff37A7aE219EcEF74C5A1Bf95d5f854";
const amWMATIC = "0x8df3aad3a84da6b69a4da8aec3ea40d9091b2ac4";
const OMEN = "0x76e63a3E7Ba1e2E61D3DA86a87479f983dE89a7E";
const QUICK = "0x831753dd7087cac61ab5644b308642cc1c33dc13";


const { nullAddress, treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  polygon: {
    tokens: [ nullAddress, amWMATIC, QUICK, '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', '0x8a953cfe442c5e8855cc6c61b1293fa648bae472', '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', ],
    owners: [DeveloperTeamWallet],
    ownTokens: [ OMEN],
  },
})
