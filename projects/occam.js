const { calculateUsdUniTvl } = require('./helper/getUsdUniTvl');
module.exports = {
    milkomeda: {
        tvl: calculateUsdUniTvl(
            '0x2ef06A90b0E7Ae3ae508e83Ea6628a3987945460',
            'milkomeda',
            '0xAE83571000aF4499798d1e3b0fA0070EB3A3E3F9',
            [
                '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844',
                '0x8d50a024B2F5593605d3cE8183Ca8969226Fcbf8',
                '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8',
                '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283'
            ],
            'cardano'
        )
    }
}
