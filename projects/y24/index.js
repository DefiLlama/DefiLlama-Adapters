const { sumTokensExport } = require('../helper/unknownTokens');

const TOKEN_ADDRESS = '0x652000ba3c230d83279AEC84A49d41d706AFB0F1';
const StakingContract1 = '0x8aCE17bAadBbAfb8178330d4C87C224a08826520';
const StakingContract2 = '0xe0Ceee33e1CE1EF4EA322B50D55d99E714B7BB6d';

module.exports = {
  methodology: 'This is the total value locked in y24 staking',
  bsc: {
    tvl: () => ({}),
    staking: sumTokensExport({owners: [StakingContract1, StakingContract2], tokens: [TOKEN_ADDRESS], lps: ['0x44628669C0F888b2884d20b94C22af465AA11f05'], useDefaultCoreAssets: true,})
  }
};

