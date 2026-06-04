const { sumTokensExport } = require('../helper/chain/cardano');

// ADA Harvest - Cardano PlutusV3 flash loan vault + yield aggregator
// Vault address (base address, delegates to a stake pool):
//   addr1zx0es78sfa3cl47pmu9tcwqc7mx9wacu270u76yrk4duk2ggucktr6zta3rtuqlqam4395sry3vl5c7ss08m50qtnj6s4zlejx
// Docs: https://ada-harvest.com

const VAULT_ADDRESS = 'addr1zx0es78sfa3cl47pmu9tcwqc7mx9wacu270u76yrk4duk2ggucktr6zta3rtuqlqam4395sry3vl5c7ss08m50qtnj6s4zlejx';

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
