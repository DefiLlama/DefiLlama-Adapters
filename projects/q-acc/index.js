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

    const issuanceSuppliesFromCurves = await api.multiCall({
        abi: abi.getVirtualIssuanceSupply,
        calls: Object.values(config).map(c => ({
            target: c.bondingCurve,
        })),
    })

    const issuanceSupplies = Object.values(config).map((configItem, index) => ({
        symbol: configItem.symbol,
        token: configItem.token,
        supply: BigInt(issuanceSuppliesFromCurves[index])
    }))

    const tokens = [ADDRESSES.polygon.WMATIC, ...issuanceSupplies.map(issuance => issuance.token)]
    const balances = [sumOfCollateralSupplies, ...issuanceSupplies.map(issuance => issuance.supply)]

    return api.addTokens(tokens, balances)
}

module.exports = {
    methodology: "TVL is counted as the value of WPOL and ABC tokens locked in the bonding curves",
    timetravel: false,
    misrepresentedTokens: true,
    polygon: {
        tvl,
    },
}