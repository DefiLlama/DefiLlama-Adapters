const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('./abi.json')
const { config } = require('./config')

async function tvl(api) {
    const collateralSupplies = await api.multiCall({
        abi: abi.getVirtualCollateralSupply,
        calls: Object.values(config).map(c => ({
            target: c.bondingCurve,
        })),
    })

    const sumOfCollateralSupplies = collateralSupplies.reduce((acc, curr) => acc + BigInt(curr), BigInt(0))

    return api.addTokens([ADDRESSES.polygon.WMATIC], [sumOfCollateralSupplies])
}

module.exports = {
    methodology: "TVL is counted as the value of WPOL tokens locked in the bonding curves",
    timetravel: false,
    misrepresentedTokens: true,
    polygon: {
        tvl,
    },
}