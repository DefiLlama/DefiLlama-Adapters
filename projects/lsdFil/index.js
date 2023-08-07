const MINT_TOKEN_CONTRACT = '0xcE5805CF6C84F71D2897f632E0Aa60d2430cCd2A';
const MINT_CLUB_BOND_CONTRACT = '0x7187b3B1314375909B775d72fB7214Cb71a7D907';
const {sumTokens2} = require('../helper/unwrapLPs');


  module.exports = {
    filecoin: {
        tvl: async (_, _1, _2, {api}) => {

            let balances = {};
            await sumTokens2({balances, owner: MINT_CLUB_BOND_CONTRACT, MINT_TOKEN_CONTRACT, api, });
            return balances;
        }
    }
}