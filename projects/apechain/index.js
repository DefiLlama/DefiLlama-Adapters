const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');
const { staking } = require('../helper/staking')

module.exports = {
    ethereum: {
        tvl: sumTokensExport({
            tokensAndOwners: [
                [ADDRESSES.ethereum.WSTETH, '0xc8a12b1DB09ec5a43919906d94Fa7eeAef1131D1'], // wstETH
                [ADDRESSES.ethereum.SDAI, '0xf33D21137cD0B878f3A18Cc60cD74F842c59cb00'], // sDAI
            ]
        }),
        staking: staking('0x5954aB967Bc958940b7EB73ee84797Dc8a2AFbb9', '0x4d224452801ACEd8B2F0aebE155379bb5D594381')
    },
};