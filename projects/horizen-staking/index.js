const { sumTokensExport } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json');

const STAKING_CONTRACT = '0x6BF7CF29a8bcE11Aa62Cf593d165C244fA4d3E31';
const ZEN = ADDRESSES.horizen.ZEN;

module.exports = {
  methodology: 'Counts ZEN tokens locked in the Horizen staking contract on Horizen L3.',
  horizen: {
    tvl: sumTokensExport({
      tokens: [ZEN],
      owners: [STAKING_CONTRACT],
    }),
  },
};
