const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

async function stBFCTvl() {
    const api = new sdk.ChainApi({ chain: "bfc" });

    const totalSupply = await api.call({
        target: ADDRESSES.bfc.stBFC,
        abi: "erc20:totalSupply",
        chain: "bfc"
    });

    const balances = {
        [`bfc:${ADDRESSES.null}`]: totalSupply
    }

    return balances
}

module.exports = {
    bfc: {
        tvl: stBFCTvl
    }
}