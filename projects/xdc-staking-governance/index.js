const { nullAddress } = require('../helper/unwrapLPs');

// Contract addresses
const Validator = "0x0000000000000000000000000000000000000088";      // XDC Validator

async function validatorTVL(api) {
    return api.sumTokens({ 
        tokensAndOwners2: [
            [nullAddress], 
            [Validator]
        ]
    });
}

module.exports = {
    start: '2019-5-31',
    xdc: {
        tvl: validatorTVL,
    },
};