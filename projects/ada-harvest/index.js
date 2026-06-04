const { sumTokensExport } = require('../helper/chain/cardano');

// ADA Harvest - Cardano PlutusV3 flash loan vault + yield aggregator
// Vault address (base address, delegates to a stake pool):
//   addr1z993rpqdxcgnncqxjyy37kjy27f94gyvwcatg7x86wk8xjcgucktr6zta3rtuqlqam4395sry3vl5c7ss08m50qtnj6slx9svv
// Docs: https://ada-harvest.com

const VAULT_ADDRESS = 'addr1z993rpqdxcgnncqxjyy37kjy27f94gyvwcatg7x86wk8xjcgucktr6zta3rtuqlqam4395sry3vl5c7ss08m50qtnj6slx9svv';

module.exports = {
  // Vault funds may later be deployed into Minswap/Liqwid, which have their own
  // adapters, so flag as double-counted to avoid inflating total Cardano TVL.
  doublecounted: true,
  methodology:
    'Counts only the ADA (lovelace) locked in the ADA Harvest PlutusV3 vault contract. ' +
    'Non-ADA assets are excluded. The vault earns flash loan fees and ADA staking rewards.',
  cardano: {
    tvl: sumTokensExport({ scripts: [VAULT_ADDRESS], tokens: ['lovelace'] }),
  },
};
