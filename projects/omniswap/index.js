const sdk = require('@defillama/sdk');
const { getUniTVL } = require('../helper/unknownTokens');

const factory = '0x2043d6f72CcD82c4Eae36fF331ADAE8C77bA5897';

const chain = 'cataclysm_1';

module.exports = {
    methodology: "TVL consists of liquidity pools created through the factory contract",
    misrepresentedTokens: true,
    cataclysm_1: {
        tvl: getUniTVL({
            factory,
            chain,
        }),
    },
};