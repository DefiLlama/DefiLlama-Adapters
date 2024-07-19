const { sumERC4626VaultsExport } = require("../helper/erc4626");

module.exports = {
    methodology: 'ETH and LSTs in vaults',
    ethereum: {
        tvl: sumERC4626VaultsExport({ 
            vaults: ["0x4412e5492C689CF13D585dCdb010B3b8b12dF16a", "0x9F5e6E972D76d4501900f4484622f9413E5Cc302", "0x3A10a803958e837599348621Edb42eF73c79aC22"],
            tokenAbi: 'tokenIn', balanceAbi: 'totalSupply'
        })
    }
}; 