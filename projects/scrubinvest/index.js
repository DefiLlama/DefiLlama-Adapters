const { sumTokensExport } = require("./helper/unwrapLPs");

module.exports = {
    fantom: {
        tvl: sumTokensExport({ 
          chain: 'kava', 
          tokensAndOwners: [
            // [tokenAddress, ownerContractAddress]
            ['0x066C98E48238e8D77006a5fA14EC3B080Fd2848d', '0xcd017B495DF1dE2DC8069b274e2ddfBB78561176'],
            ['0x92e17FD2DA50775FBD423702E4717cCD7FB2A6BB', '0x88555c4d8e53ffB223aB5baDe0B5e6B2Cd3966c4'],
            ['0x58333b7D0644b52E0e56cC3803CA94aF9e0B52C3', '0xB4Ba7ba722eacAE8f1e4c6213AF05b5E8B27dbdB'],
          ],
        }),
    }
};