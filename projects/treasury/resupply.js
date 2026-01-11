const { treasuryExports } = require('../helper/treasury');

module.exports = treasuryExports({
    ethereum: {
        owners: ['0x4444444455bF42de586A88426E5412971eA48324'],
        ownTokens: [
            '0x57aB1E0003F623289CD798B1824Be09a793e4Bec', //reUSD
            '0x419905009e4656fdC02418C7Df35B1E61Ed5F726' //RSUP
        ],
        blacklistedTokens: ['0xEe351f12EAE8C2B8B9d1B9BFd3c5dd565234578d']
    }
})