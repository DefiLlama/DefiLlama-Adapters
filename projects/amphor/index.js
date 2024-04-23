const { sumERC4626VaultsExport } = require('../helper/erc4626');

const config = {
    ethereum: {
        lvTokens: {
            'ampr-LP-USD': '0x3b022EdECD65b63288704a6fa33A8B9185b5096b',
            'ampr-LP-ETH': '0x2791EB5807D69Fe10C02eED6B4DC12baC0701744',
            'ampr-LP-BTC': '0xC4A324fDF8a2495776B4d6cA46599B5a52f96489',
            amprPTweETH: '0xf97ecda5F9ff31d83f635a6EA70D2D3B9C8f2e00',
            amprPTrsETH: '0x0498b85FB4EC85EF5EFe82513aa9DaF767358A15',
            amprPTezETH: '0x920F17e741029D904936c58a545DFFC72f82C079',
        },
    },
};

Object.keys(config).forEach((chain) => {
    const { lvTokens } = config[chain];
    module.exports[chain] = {
        tvl: sumERC4626VaultsExport({
            vaults: Object.values(lvTokens),
            tokenAbi: 'asset',
            balanceAbi: 'totalAssets',
        })
    };
});

module.exports.hallmarks = [
            [1710115200, "Beta test closing"],
            [1712361600, "LRT vault release"],
]
