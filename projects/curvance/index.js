const ADDRESSES = require('./contracts.json');
const native = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

async function sumAndPrice(api, tokenAddress, wrapped_native) {
    const supply = await api.call({ abi: 'uint256:totalAssets', target: tokenAddress });
    let asset = await api.call({ abi: 'address:asset', target: tokenAddress });

    try {
        const vaultAsset = await api.call({ abi: 'address:asset', target: asset });
        asset = native == String(vaultAsset).toLowerCase() ? wrapped_native : vaultAsset; 
    } catch (e) {}


    return api.add(asset, supply);
};

const monadTvl = async (api) => {
    let promises = [];
    const wrapped_native = "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A";
    for(const market of Object.values(ADDRESSES.monad)) {
        for(const address of Object.values(market)) {
            promises.push(sumAndPrice(api, address, wrapped_native));
        }
    }
    await Promise.all(promises);
}

module.exports = {
    monad: {
        tvl: monadTvl
    }
}
