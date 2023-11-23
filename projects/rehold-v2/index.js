const { sumTokensExport } = require('../helper/unwrapLPs')

const VAULT_V2 = '0xde6b4964c4384bcdfa150a4a8be9865c5b91e29c';

const tvl = sumTokensExport({ owner: VAULT_V2, fetchCoValentTokens: true, blacklistedTokens: ['0x594f9274e08ba6c5760bacfba795b1879af17255'], })

module.exports = {
  ethereum: { tvl },
  bsc: { tvl },
  polygon: { tvl },
  avax: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
  base: { tvl },

  hallmarks: [
    [1688688480, "ReHold V2 Launch"],
    [1689743327, "Ethereum Deployment"],
    [1690898169, "Limit Orders Launch"],
    [1698624000, "ReHold Swaps Launch"],
  ],
};
