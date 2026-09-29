const methodologies = require('../helper/methodologies');

const VAULT = '0xcE4602C16f6e83eEa77BFb3CCe6f6BCE9EcBb92E';

async function tvl(api) {
    const asset = await api.call({ abi: 'address:asset', target: VAULT });
    const cash = await api.call({ abi: 'erc20:balanceOf', target: asset, params: [VAULT] });
    api.add(asset, cash);
}

async function borrowed(api) {
    const asset = await api.call({ abi: 'address:asset', target: VAULT });
    const [totalAssets, cash] = await Promise.all([
        api.call({ abi: 'uint256:totalAssets', target: VAULT }),
        api.call({ abi: 'erc20:balanceOf', target: asset, params: [VAULT] }),
    ]);
    const lent = BigInt(totalAssets) - BigInt(cash);
    if (lent > 0n) api.add(asset, lent.toString());
}

module.exports = {
    methodology: methodologies.lendingMarket,
    wc: {
        tvl,
        borrowed,
    },
};
