const { treasuryExports } = require('../helper/treasury');

const COOK_TOKEN_ADDRESS = '0x9F0C013016E8656bC256f948CD4B79ab25c7b94D';

module.exports = treasuryExports({
    ethereum: {
        owners: [
            '0x00354d59E829fB79e2Ff7D8a022553728520cB6A', '0x18d336d33a5be54cC62C9034e3a66e3220AA268a',
            '0xfB7e8892fBDa0205f6BbdbCd90dD9b0bDD321D16',
        ],
        ownTokens: [COOK_TOKEN_ADDRESS],
    },
    mantle: {
        owners: [
            '0x0CA28e2D07268325ce7f5eCe5ACde658a4769CD7',
            '0x931FCb5bC6CaFaFbA0Ce921f31AFD27C144F2fD5',
            '0x381e7741a183C8E0c6Ec1AFa183842E597144Ed0',
        ],
        ownTokens: [COOK_TOKEN_ADDRESS]
    }

})