const { sumTokensExport } = require('../helper/unwrapLPs');
 
// Enso finance TVL lies for now in the index tokens held by the liquidityMigration contracts
const liquidityMigrationV2_contract = '0x0c6D898ac945E493D25751Ea43BE2c8Beb881D8C';

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: liquidityMigrationV2_contract, fetchCoValentTokens: true, tokens: [
      '0x0327112423f3a68efdf1fcf402f6c5cb9f7c33fd',
      '0x126c121f99e1e211df2e5f8de2d96fa36647c855',
      '0x7b18913d945242a9c313573e6c99064cd940c6af',
      '0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c',
      '0xe5feeac09d36b18b3fa757e5cf3f8da6b8e27f4c',
    ] }),
  },
  methodology:
    `Get the list of whitelisted index tokens from accepted adapters - TokenSet IndexCoop Indexed PowerPool and PieDAO - and query the amounts held by the vampire LiquidityMigrationV2 contract`,
};