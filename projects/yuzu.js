const { calculateUsdUniTvl } = require('./helper/getUsdUniTvl');
module.exports = {
    oasis: {
        tvl: calculateUsdUniTvl(
            '0x5F50fDC22697591c1D7BfBE8021163Fc73513653',
            'oasis',
            '0x21C718C22D52d0F3a789b752D4c2fD5908a8A733',
            [
                '0xdC19A122e268128B5eE20366299fc7b5b199C8e3',
            ],
            'oasis-network'
        )
    },
};