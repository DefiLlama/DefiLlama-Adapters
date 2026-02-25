const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

// Chip contracts custody the original tokens 1:1.
// Track original token balances held by each chip contract.
const tokensAndOwners = [
  [ADDRESSES.flare.WFLR, '0xf764EECe331caB7D7c451a3972e139B4645d6fe8'],                   // WFLR
  ['0x12e605bc104e93B45e1aD99F9e555f659051c2BB', '0x23011e38Addd5dA64ab8Ad940eE6219095E39382'], // sFLR
  ['0xe7cd86e13AC4309349F30B3435a9d337750fC82D', '0x7e1C6870be30c1f8216f0187C7f181C13c52977A'], // USDT0
  ['0xAd552A648C74D49E10027AB8a618A3ad4901c5bE', '0x695b696E80f6f7137731eF509D64023F17550eCE'], // FXRP
  ['0x4C18Ff3C89632c3Dd62E796c0aFA5c07c4c1B2b3', '0x4D131a30aE842B3290651EEd58466a0bC0aC6FD1'], // stXRP
];

module.exports = {
  methodology:
    'TVL is the sum of assets locked into chip contracts on Flare.',
  flare: {
    tvl: (api) => sumTokens2({ api, tokensAndOwners }),
  },
};
