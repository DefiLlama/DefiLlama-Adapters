const sdk = require('@defillama/sdk');
const { staking } = require('../helper/staking');

// Engyx token contract (BEP-20)
const ENGYX_TOKEN_CONTRACT = '0xe1ec410835e5dFA47A6893448Cbc0AC216dBE642';

// Wallets holding ENGX (not used in TVL until token has market value)
const ENGYX_WALLETS = [
  '0x058BAA4a1466Ac45D383c1813089f95e11658fD4',
  '0x792871536771e9DD3e9141158B0D86b8F56E1F89',
  '0x849f6EfB27726DFdbAC21B29754a9c98e25B4d4E',
  '0x3149245225Ef28297834c5BeC6776f42c56cCe36',
  '0xb7DE9BDD8Ad938F986F57f2b5d740C973e54ABF2',
  '0xBE2d1D4330d7C589AB0D5F34b2Aef7D8570b7937',
  '0xD20fF9eBa96CfB12E95804544870B141184deC80',
];

module.exports = {
  methodology: 'Counts Engyx tokens locked in staking contract (pre-launch). Wallet balances are documented but not included in TVL.',
  start: 0,
  timetravel: true,
  misrepresentedTokens: false,
  bsc: {
    tvl: () => ({}), // No TVL counted until ENGX has market value
    staking: staking(ENGYX_TOKEN_CONTRACT),
  },
};
