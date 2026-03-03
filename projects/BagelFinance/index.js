const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

// Bagel Finance Vault Contract Addresses
const VAULT_ADDRESSES = [
// Restore the original vault address
  "UQCAE4qPVnHfpJ-iMF736utV1q8rruv2KRwi-wPw9Bx9ldAC"
];

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Counts the total value of assets locked in all Bagel Finance vaults.',
  ton: {
    tvl: sumTokensExport({ owners: VAULT_ADDRESSES, tokens: [ADDRESSES.null] }),
  }
}