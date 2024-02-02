const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

async function tvl(_, _1, _2, { api }) {
    const pooledZeta = await sdk.api.abi.call({
        chain: 'zeta',
        target: "0x45334a5B0a01cE6C260f2B570EC941C680EA62c0",
        abi: "uint256:getTotalPooledZETA"
    })

    return {
        [ADDRESSES.null]: pooledZeta.output,
    }
}

module.exports = {
    timetravel: true,
    doublecounted: true,
    zeta: {
        tvl
    }
}
