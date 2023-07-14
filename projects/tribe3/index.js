const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/sumTokens');

module.exports = {
    arbitrum: { 
        tvl: sumTokensExport({
            tokensAndOwners: [
                // DEX
                [ADDRESSES.arbitrum.WETH, '0x01b6407adf740d135ddf1ebdd1529407845773f3'],
                // Insurance fund
                [ADDRESSES.arbitrum.WETH, '0x3af692a5ab2da34f742686bd4a77b5e609ee9ec6'],
            ]
        })
    },
};
