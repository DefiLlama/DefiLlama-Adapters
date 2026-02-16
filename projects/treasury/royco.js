const { treasuryExports } = require("../helper/treasury");

// multisig
const treasury = '0x170ff06326ebb64bf609a848fc143143994af6c8';

module.exports = treasuryExports({
    ethereum: {
        tokens: [
            '0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c',
        ],
        owners: [treasury,],
    },
})