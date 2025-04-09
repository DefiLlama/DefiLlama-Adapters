const sdk = require('@defillama/sdk');
const { getUniTVL } = require('../helper/unknownTokens');

const factory = '0x2043d6f72CcD82c4Eae36fF331ADAE8C77bA5897';

const chain = 'nibiru_evm';

module.exports = {
    misrepresentedTokens: true,
    nibiru_evm: {
        tvl: getUniTVL({
            factory,
            chain,
        }),
    },
};