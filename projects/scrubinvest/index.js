const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
    kava: {
        tvl: sumTokensExport({ 
          chain: 'kava', 
          tokensAndOwners: [
            // [tokenAddress, ownerContractAddress]
            // YieldOptimizers Mare
            ['0x066C98E48238e8D77006a5fA14EC3B080Fd2848d','0xcd017B495DF1dE2DC8069b274e2ddfBB78561176'],
            ['0x92e17FD2DA50775FBD423702E4717cCD7FB2A6BB','0x88555c4d8e53ffB223aB5baDe0B5e6B2Cd3966c4'],
            ['0x58333b7D0644b52E0e56cC3803CA94aF9e0B52C3','0xB4Ba7ba722eacAE8f1e4c6213AF05b5E8B27dbdB'],
            ['0x24149e2D0D3F79EBb7Fc464b09e3628dE395b39D','0xB9774bB2A18Af59Ec9bf86dCaeC07473A2D2F230'],
            // Vaults Equilibre Scrub
            ['0xeA848151ACB1508988e56Ee7689F004df2B15ced',"0x4402Cf5433D57266563979654d20887AcE672393"],
            ['0x7f8ed7d31795dc6f5fc5f6685b11419674361501',"0xa2355f35Ab85f1771FB1085a0e5b2599B8F47457"],
            ['0x09d6561b3795ae237e42f7adf3dc83742e10a2e8',"0x2c1C6aaB89272d07B7f78bFe93eefb6D2631Cf94"],
          ],
          resolveLPs: true,
        }),
    }
};
