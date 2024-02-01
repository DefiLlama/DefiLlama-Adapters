const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');
const VAULT_ARBITRUM = '0x4a7c10780afdba628332e31c9e7d1675cfad594c';
const VAULT_BSC = '0xedB6CD4fdd2F465d2234f978276F9Ed2EE02102c';
const VAULT_ZKSYNC_ERA = '0x211ac72f3ee4a35523B41aA8D67644E1eF860059';
const VAULT_ETHEREUM = '0x1DE35eB48f92Fb38dee51041AAE86FFf18029E90';
const VAULT_OPTIMISM = '0xedB6CD4fdd2F465d2234f978276F9Ed2EE02102c';
const VAULT_POLYGON = '0xedB6CD4fdd2F465d2234f978276F9Ed2EE02102c';
const VAULT_MANTLE = '0xedB6CD4fdd2F465d2234f978276F9Ed2EE02102c';
const VAULT_AVALANCHE = '0xedB6CD4fdd2F465d2234f978276F9Ed2EE02102c';
const VAULT_LINEA = '0xedB6CD4fdd2F465d2234f978276F9Ed2EE02102c';
const VAULT_MANTA = '0xedB6CD4fdd2F465d2234f978276F9Ed2EE02102c';

module.exports = {
    methodology: 'USDT tokens held by the RubyDex Vault contract.',
    arbitrum: {
        tvl: sumTokensExport({ owner: VAULT_ARBITRUM, tokens: [ADDRESSES.arbitrum.USDT] }),
    },
    bsc: {
        tvl: sumTokensExport({ owner: VAULT_BSC, tokens: [ADDRESSES.bsc.USDT] }),
    },
    era: {
        tvl: sumTokensExport({ owner: VAULT_ZKSYNC_ERA, tokens: [ADDRESSES.era.USDT] }),
    },
    ethereum: {
        tvl: sumTokensExport({ owner: VAULT_ETHEREUM, tokens: [ADDRESSES.ethereum.USDT] }),
    },
    optimism: {
        tvl: sumTokensExport({ owner: VAULT_OPTIMISM, tokens: [ADDRESSES.optimism.USDT] }),
    },
    polygon: {
        tvl: sumTokensExport({ owner: VAULT_POLYGON, tokens: [ADDRESSES.polygon.USDT] }),
    },
    mantle: {
        tvl: sumTokensExport({ owner: VAULT_MANTLE, tokens: [ADDRESSES.mantle.USDT] }),
    },
    avax: {
        tvl: sumTokensExport({ owner: VAULT_AVALANCHE, tokens: [ADDRESSES.avax.USDt] }),
    },
    linea: {
        tvl: sumTokensExport({ owner: VAULT_LINEA, tokens: [ADDRESSES.linea.USDT] }),
    },
    manta: {
        tvl: sumTokensExport({ owner: VAULT_MANTA, tokens: [ADDRESSES.manta.USDT] }),
    }
}; 
