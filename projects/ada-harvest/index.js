const { sumTokensExport } = require('../helper/chain/cardano');

// ADA Harvest - Cardano DeFi yield aggregator + flash loan vault
// Vault address: addr1w89u29sdr6aazr6v9zhdk6vh4az75enlzph2372v3tq55usz9ale6
// Docs: https://ada-harvest.com

const VAULT_ADDRESS = 'addr1w89u29sdr6aazr6v9zhdk6vh4az75enlzph2372v3tq55usz9ale6';

module.exports = {
  methodology: 'Counts ADA locked in the ADA Harvest PlutusV3 vault contract. The vault earns yield via flash loan fees, AI-council-governed DeFi protocol deployments, and ADA staking rewards.',
  cardano: {
    tvl: sumTokensExport({ scripts: [VAULT_ADDRESS] }),
  },
};
