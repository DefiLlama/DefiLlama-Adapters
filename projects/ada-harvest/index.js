const { sumTokensExport } = require('../helper/chain/cardano');

// ADA Harvest - Cardano PlutusV3 flash loan vault + yield aggregator
// Vault address (base address, delegates to a stake pool):
//   addr1z9mhqtrnwpc76frp2xtgtfyt4lwzzdfwsye0uh335kycu4sgucktr6zta3rtuqlqam4395sry3vl5c7ss08m50qtnj6s5usxpa
// Docs: https://ada-harvest.com

const VAULT_ADDRESS = 'addr1z9mhqtrnwpc76frp2xtgtfyt4lwzzdfwsye0uh335kycu4sgucktr6zta3rtuqlqam4395sry3vl5c7ss08m50qtnj6s5usxpa';

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
