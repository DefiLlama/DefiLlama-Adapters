const abi = {
    "underlyingAsset": "function underlyingAsset() external view returns (address)",
    "totalAssets": "function totalAssets() external view returns (uint256)"
  };
const { getConfig } = require('../helper/cache');
const { staking } = require('../helper/staking')

// lite.api.yelay.io (vault list) has been returning 503 since ~2026-08; the static lists below come from
// https://github.com/YieldLayer/yelay-lite/tree/12166bb607ea55ef27089cc665746a8380c07893/deployments (+ main),
// and any extra vaults the api returns while it is up are merged in
const vaultsEndpoint = (chainId) =>
    `https://lite.api.yelay.io/v2/vaults?chainId=${chainId}`;

const chains = [
    {chainId: 1, name: "ethereum", vaults: [
        '0x39DAc87bE293DC855b60feDd89667364865378cc', // USDC
        '0x4d95E929ABb21b6C6C0FF1ff0Ac69609e02BB368', // WETH
        '0x6545e81356CE709823EA8797E566A60934A9B110', // WBTC
        '0x615989F57f6da73C3a1f96a347536941D88e7E0A', // USDC (current deployment)
    ]},
    {chainId: 146, name: "sonic", vaults: [
        '0x56b0c5C989C65e712463278976ED26D6e07592ab', // USDC.e
        '0x6880bb001417f123f824c573A07a991e0cD00daC', // wS
        '0xAB865D95A574511a6c893C38A4D892275ca70570', // WETH
    ]},
    {chainId: 8453, name: "base", vaults: [
        '0x0c6dAf9B4e0EB49A0c80c325da82EC028Cb8118B', // USDC
        '0xf0533A9eb11b144aC3B9BbE134728D0F7F547c52', // WETH
        '0x47a879ac3C9646116326B4A1462e1D477056Aff0', // cbBTC
    ]},
];

module.exports = {
    methodology: `Counting totalAssets held by vaults.`,
};

chains.forEach(({chainId, name, vaults: staticVaults}) => {
    module.exports[name] = {
        tvl: async (api) => {
            const apiVaults = await getConfig(`yelay-v3/${name}`, vaultsEndpoint(chainId));
            const vaults = [...new Set([
                ...staticVaults,
                ...(Array.isArray(apiVaults) ? apiVaults.map((v) => v.address) : []),
            ].map((v) => v.toLowerCase()))];
            const underlying = await api.multiCall({ abi: abi.underlyingAsset, calls: vaults });
            const balances = await api.multiCall({ abi: abi.totalAssets, calls: vaults });
            underlying.forEach((u, i) => api.addTokens(u, balances[i]));
            return api.getBalances();
        },
        ...(name === 'ethereum' && {
            staking: staking('0x8e933387AFc6F0F67588e5Dac33EBa97eF988C69', '0xAEe5913FFd19dBcA4Fd1eF6F3925ed0414407d37'),
        }),
    };
});
