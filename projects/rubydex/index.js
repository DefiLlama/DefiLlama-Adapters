const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');
const VAULT_CONTRACT = '0x4a7c10780afdba628332e31c9e7d1675cfad594c';

module.exports = {
    methodology: 'counts the number of USDT tokens in the RubyDex Vault contract.',
    arbitrum: {
        tvl: sumTokensExport({ owner: VAULT_CONTRACT, tokens: [ADDRESSES.arbitrum.USDT] }),
    }
}; 
