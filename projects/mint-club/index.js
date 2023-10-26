const { sumTokensExport } = require('../helper/unwrapLPs');
const MINT_TOKEN_CONTRACT = '0x1f3Af095CDa17d63cad238358837321e95FC5915';
const MINT_CLUB_BOND_CONTRACT = '0x8BBac0C7583Cc146244a18863E708bFFbbF19975';

module.exports = {
  bsc: {
    tvl: () => ({}),
    staking: sumTokensExport({ owner: MINT_CLUB_BOND_CONTRACT, tokens: [MINT_TOKEN_CONTRACT]})
  }
}; // node test.js projects/mint-club/index.js