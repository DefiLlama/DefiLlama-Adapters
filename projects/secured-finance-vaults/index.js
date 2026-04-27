const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');
const { getConfig } = require('../helper/cache');

const v1Vaults = [];
const blacklist = [...v1Vaults].map(i => i.toLowerCase());

async function tvl(api) {
    const data = await getConfig(
        'secured-finance-vaults-' + api.chain,
        `https://vault-api.secured.finance/vaults?highlight_multi_single&hideAlways=false&orderBy=featuringScore&orderDirection=desc&strategiesDetails=withDetails&strategiesCondition=inQueue&chainIDs=${api.chainId}&limit=2500`
    );

    if (!Array.isArray(data)) return;

    const strategies = data
        .map(v => v.strategies ?? [])
        .flat()
        .map(v => v.address.toLowerCase());
    const vaults = data
        .filter(i => +i.tvl.tvl > 0)
        .map(v => v.address.toLowerCase())
        .filter(i => !blacklist.includes(i) && !strategies.includes(i));
    const bals = await api.multiCall({
        abi: 'uint256:totalAssets',
        calls: vaults,
    });
    const calls = [];
    const filteredBals = bals.filter((bal, i) => {
        const hasBal = +bal > 0;
        if (hasBal) calls.push(vaults[i]);
        return hasBal;
    });
    const tokens = await api.multiCall({
        abi: 'address:token',
        calls,
        permitFailure: true,
    });

    const tokensAlt = await api.multiCall({
        abi: 'address:asset',
        calls,
        permitFailure: true,
    });
    filteredBals.forEach((bal, i) => {
        const token = tokens[i] || tokensAlt[i];
        if (token) api.add(token, bal);
    });
    if (api.chain === 'ethereum') {
        const tokens = await api.multiCall({
            abi: 'address:token',
            calls: v1Vaults,
        });
        let bals = await api.multiCall({
            abi: 'erc20:totalSupply',
            calls: v1Vaults,
        });
        const ratio = await api.multiCall({
            abi: 'uint256:getPricePerFullShare',
            calls: v1Vaults,
        });
        bals = bals.map((bal, i) => (bal * ratio[i]) / 1e18);
        api.addTokens(tokens, bals);
    }
    return sumTokens2({ api, resolveLP: api.chain !== 'ethereum' });
}

module.exports = {
    doublecounted: true,
    timetravel: false,
};

const chains = ['ethereum'];

chains.forEach(chain => {
    module.exports[chain] = { tvl };
});
