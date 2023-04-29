const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');
const ARBITRUM_USDT = ADDRESSES.arbitrum.USDT;
const VAULT_CONTRACT = '0xa55D96B2EC5c5899fC69886CACfCba65b91bf8B6';

module.exports = {
    methodology: 'counts the number of USDT tokens in the RubyDex Vault contract.',
    arbitrum: {
        tvl: sumTokensExport({ owner: VAULT_CONTRACT, tokens: [ARBITRUM_USDT] }),
    }
}; 