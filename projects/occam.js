const { calculateUsdUniTvl } = require('./helper/getUsdUniTvl');
module.exports = {
    milkomeda: {
        tvl: calculateUsdUniTvl(
            '0x2ef06A90b0E7Ae3ae508e83Ea6628a3987945460',
            'milkomeda',
            '0xAE83571000aF4499798d1e3b0fA0070EB3A3E3F9',
            [
                '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844',
            ],
            'cardano'
        )
    }
};