const abi = require("./abi.json");
const {fetchURL} = require("../helper/utils");

const vaultsEndpoint = (chainId) =>
    `https://lite.api.yelay.io/v2/vaults?chainId=${chainId}`;

const chains = [
    {chainId: 1, name: "ethereum"},
    {chainId: 146, name: "sonic"},
    {chainId: 8453, name: "base"},
];

module.exports = {
    methodology: `Counting totalAssets held by vaults.`,
};

chains.forEach(({chainId, name}) => {
    module.exports[name] = {
        tvl: async (api) => {
            const vaults = await fetchURL(vaultsEndpoint(chainId)).then(
                (r) => r.data
            );
            const underlying = await api.multiCall({
                abi: abi.underlyingAsset,
                calls: vaults.map((v) => v.address),
            });
            const balances = await api.multiCall({
                abi: abi.totalAssets,
                calls: vaults.map((v) => v.address),
            });
            underlying.forEach((u, i) => api.addTokens(u, balances[i]));
            return api.getBalances();
        },
    };
});
