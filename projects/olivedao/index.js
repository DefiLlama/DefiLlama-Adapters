const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const ethPool = "0x8e300739960457B532Af3bEd62475B790e0Dee5E"
const usdcPool = "0x05a37e1745926D8725A6C5dbD7Fd9873Dd9E356e"
const usdcMatic = ADDRESSES.polygon.USDC
const wethMatic = ADDRESSES.polygon.WETH_1

module.exports = {    
    polygon: {
        tvl: sumTokensExport({
            tokensAndOwners: [
                [usdcMatic, usdcPool],
                [wethMatic, ethPool],
            ]
        })
    }    
}