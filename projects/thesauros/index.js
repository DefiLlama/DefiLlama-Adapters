const { sumERC4626VaultsExport } = require('../helper/erc4626');

// v1: original vaults, v2: upgraded vaults deployed in August 2026
const config = {
  arbitrum: [
    '0x57C10bd3fdB2849384dDe954f63d37DfAD9d7d70', // tUSDC Vault (v1)
    '0xcd72118C0707D315fa13350a63596dCd9B294A30', // tUSDT Vault (v1)
    '0x4E5c0A4C11d713002D74bA43a458efc31bc76378', // tUSDC Vault (v2)
  ],
  base: [
    '0x6C7013b3596623d146781c90b4Ee182331Af6148', // tUSDC Vault (v1)
    '0x3C7739173cca612B6394EE57131458185A5beC44', // tUSDC Vault (v2)
  ],
  plasma: [
    '0x2Ed9B7fB6Bbe0920145B2a79c18C3f7cFCAE3C99', // tUSDT0 Vault
  ],
  monad: [
    '0x40F1fBf6a92155a6D321c09936234BFEb9Ec4760', // tUSDC Vault
  ]
};

module.exports = {
  doublecounted: true,
  methodology: "TVL displays the total amount of assets stored in the Thesauros vaults. The balance of each vault is calculated by summing the deposits held across its yield providers.",
  start: '2025-09-19',
  hallmarks: [
    ['2025-09-19', "Protocol launch"],
    ['2026-08-06', "V2 launch and expansion to Plasma and Monad"],
  ],
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl: sumERC4626VaultsExport({ vaults: config[chain], isOG4626: true }) };
});
