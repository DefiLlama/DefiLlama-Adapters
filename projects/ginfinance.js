const { calculateUsdUniTvl } = require('./helper/getUsdUniTvl');
module.exports = {
    boba: {
        tvl: calculateUsdUniTvl(
            '0x06350499760aa3ea20FEd2837321a84a92417f39',
            'boba',
            '0x5de1677344d3cb0d7d465c10b72a8f60699c062d',
            [
                '0xa18bf3994c0cc6e3b63ac420308e5383f53120d7', // BOBA
                '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000', // ETH
                '0x66a2a913e447d6b4bf33efbec43aaef87890fbbc', // GIN
            ],
            'tether',
            6
        )
    }
};