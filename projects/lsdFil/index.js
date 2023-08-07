const MINT_TOKEN_CONTRACT = '0xcE5805CF6C84F71D2897f632E0Aa60d2430cCd2A';
const MINT_CLUB_BOND_CONTRACT = '0x7187b3B1314375909B775d72fB7214Cb71a7D907';
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  filecoin: {
    tvl: sumTokensExport({ owner: MINT_TOKEN_CONTRACT, tokens: [MINT_CLUB_BOND_CONTRACT] })
  }
}