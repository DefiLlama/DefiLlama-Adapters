const { sumTokensExport } = require('../helper/unwrapLPs');
const { staking } = require('../helper/staking')

module.exports = {
    ethereum: {
        tvl: sumTokensExport({
            tokensAndOwners: [
                ['0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', '0xc8a12b1DB09ec5a43919906d94Fa7eeAef1131D1'], // wstETH
                ['0x83F20F44975D03b1b09e64809B757c47f942BEeA', '0xf33D21137cD0B878f3A18Cc60cD74F842c59cb00'], // sDAI
            ]
        }),
        staking: staking('0x5954aB967Bc958940b7EB73ee84797Dc8a2AFbb9', '0x4d224452801ACEd8B2F0aebE155379bb5D594381')
    },
};