const abi = {
    "underlyingAsset": "function underlyingAsset() external view returns (address)",
    "totalAssets": "function totalAssets() external view returns (uint256)"
  };
const { getConfig } = require('../helper/cache');
const { staking } = require('../helper/staking')

// the vault list comes from lite.api.yelay.io which is intermittently 503; getConfig caches the last good response
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
            const vaults = await getConfig(`yelay-v3/${name}`, vaultsEndpoint(chainId));
            if (!Array.isArray(vaults)) throw new Error(`yelay vault list unavailable for ${name} (api down and no cached copy)`)
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
        ...(name === 'ethereum' && {
            staking: staking('0x8e933387AFc6F0F67588e5Dac33EBa97eF988C69', '0xAEe5913FFd19dBcA4Fd1eF6F3925ed0414407d37'),
        }),
    };
});
