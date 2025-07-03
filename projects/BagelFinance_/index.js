const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

// Bagel Finance Vault Contract Addresses
const VAULT_ADDRESSES = [
  // TON DeFi Index
  "EQAnERLO28c_3ikzJNvNoTVSXJSTKNi-KBWf4n_VJcZK_BnE",
  // TON LSTs Index
  "EQD-KyngZ3TD72CAcf8MyzceFNH_w1wWmeOZbbff9X-lWzQE",
  // TON USDs Index
  "EQC2MoinDLndsppOd-i0FhPlZby5SlL3l5txPNP_u-vSpO3P",
  // TON OGs Index
  "EQBYFBWkDvzqY88BZ9S2U-8F4k8Xay-rfxCgzv--FepcBKJW"
];

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Counts the total value of assets locked in all Bagel Finance vaults.',
  ton: {
    tvl: sumTokensExport({ owners: VAULT_ADDRESSES, tokens: [ADDRESSES.null] }),
  }
}