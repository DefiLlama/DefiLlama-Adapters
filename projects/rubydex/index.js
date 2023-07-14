const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');
const VAULT_ARBITRUM = '0x4a7c10780afdba628332e31c9e7d1675cfad594c';
const VAULT_BSC = '0xedB6CD4fdd2F465d2234f978276F9Ed2EE02102c';

module.exports = {
    methodology: 'USDT tokens held by the RubyDex Vault contract.',
    arbitrum: {
        tvl: sumTokensExport({ owner: VAULT_ARBITRUM, tokens: [ADDRESSES.arbitrum.USDT] }),
    },
    bsc: {
        tvl: sumTokensExport({ owner: VAULT_BSC, tokens: [ADDRESSES.bsc.USDT] }),
    }
}; 
