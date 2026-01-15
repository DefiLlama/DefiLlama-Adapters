const ADDRESSES = require('../helper/coreAssets.json')
const SAVAX = ADDRESSES.avax.SAVAX;

async function tvl(api) {
    const pooledAvax = await api.call({ target: SAVAX, abi:  "uint256:totalPooledAvax", });
    api.addGasToken(pooledAvax)
}

module.exports = {
    avax: {
        tvl,
    },
    methodology: "Counts staked AVAX tokens.",
    hallmarks: [
        [1643199567, "Benqi SAVAX Launched"]
    ],
}
