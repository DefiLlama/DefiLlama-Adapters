const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/sumTokens');

module.exports = {
    arbitrum: { 
        tvl: sumTokensExport({
            tokensAndOwners: [
                // DEX
                [ADDRESSES.arbitrum.WETH, '0x6fc05B7DFe545cd488E9D47d56CFaCA88F69A2e1'],
                // Insurance fund
                [ADDRESSES.arbitrum.WETH, '0x035E4480437002A30b61Df6788DFb6199c2C5210'],
            ]
        })
    },
    hallmarks: [
        [1688695200, "v1 shutdown"],
    ],
};
