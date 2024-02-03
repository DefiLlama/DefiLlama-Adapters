const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

async function tvl(_, _1, _2, { api }) {
    const pooledZeta = await sdk.api.abi.call({
        chain: 'zeta',
        target: "0x82bbc3f521E5313cf5e8401797d7BaB6c030C908",
        abi: "uint256:getTotalPooledZeta"
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