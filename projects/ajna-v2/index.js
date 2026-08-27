const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs');

// Ajna deploys pools through two permissionless factories per chain: an
// ERC20PoolFactory (fungible collateral) and an ERC721PoolFactory (NFT collateral).
// getDeployedPoolsList() on each factory returns every pool it has deployed, so new
// pools are picked up automatically.
const factories = {
    ethereum: { erc20: '0x6146DD43C5622bB6D12A5240ab9CF4de14eDC625', erc721: '0x27461199d3b7381De66a85D685828E967E35AF4c' },
    arbitrum: { erc20: '0xA3A1e968Bd6C578205E11256c8e6929f21742aAF', erc721: '0x6ae3324612bEfD4AE460244c369f30Ab9CB8cAE2' },
    avax: { erc20: '0x2aA2A6e6B4b20f496A4Ed65566a6FD13b1b8A17A', erc721: '0xB3d773147A086A23fB72dcc03828C66DcE5D6627' },
    base: { erc20: '0x214f62B5836D83f3D6c4f71F174209097B1A779C', erc721: '0xeefEC5d1Cc4bde97279d01D88eFf9e0fEe981769' },
    blast: { erc20: '0xcfCB7fb8c13c7bEffC619c3413Ad349Cbc6D5c91', erc721: '0x6C046C4b072404ce7865a7c317b432B5e269822A' },
    bsc: { erc20: '0x86eE95085F204B525b590f21dec55e2373F6da69', erc721: '0x8A4DaF211979f60339D26b9Eb1407D74fA36a52a' },
    filecoin: { erc20: '0x0E4a2276Ac259CF226eEC6536f2b447Fc26F2D8a', erc721: '0x07Eb44ca94cddA4016cECCe7FB9C7Ae73DBD4306' },
    xdai: { erc20: '0x87578E357358163FCAb1711c62AcDB5BBFa1C9ef', erc721: '0xc7Fc13Fa7B697fBE3bdC56D5b9A6586A83254126' },
    hemi: { erc20: '0xE47b3D287Fc485A75146A59d459EC8CD0F8E5021', erc721: '0x3E0126d3B10596b7E13e42E34B7cBD0E9735e4c0' },
    linea: { erc20: '0xd72A448C3BC8f47EAfFc2C88Cf9aC9423Bfb5067', erc721: '0x0c1Fa8D707dFb57551efa21C16255BEAb13F5bCD' },
    mode: { erc20: '0x62Cf5d9075D1d6540A6c7Fa836162F01a264115A', erc721: '0x2189eC0743e36f2CB51BEdaf089d686BC0996e03' },
    optimism: { erc20: '0x609C4e8804fafC07c96bE81A8a98d0AdCf2b7Dfa', erc721: '0xAAa20ba75A7ed4Fa895E4659861448a828fa6E48' },
    polygon: { erc20: '0x1f172F881eBa06Aa7a991651780527C173783Cf6', erc721: '0x8B7f874D15c25BeCC4F7c1906b3677533fe60A6e' },
};

async function getPools(chain, api) {
    const { erc20, erc721 } = factories[chain];
    // permitFailure so a single unreachable/reverting factory can't fail the chain
    const lists = await api.multiCall({ abi: 'address[]:getDeployedPoolsList', calls: [erc20, erc721], permitFailure: true });
    return { erc20Pools: lists[0] || [], erc721Pools: lists[1] || [] };
}

async function getTvl(chain, api) {
    const { erc20Pools, erc721Pools } = await getPools(chain, api);
    const ownerTokens = [];

    if (erc20Pools.length) {
        const collaterals = await api.multiCall({ abi: 'address:collateralAddress', calls: erc20Pools, permitFailure: true });
        const quotes = await api.multiCall({ abi: 'address:quoteTokenAddress', calls: erc20Pools, permitFailure: true });
        erc20Pools.forEach((pool, i) => ownerTokens.push([[collaterals[i], quotes[i]].filter(Boolean), pool]));
    }

    // ERC721 pools hold NFT collateral (balanceOf returns a count, not a priceable
    // amount), so only the quote token is counted as TVL.
    if (erc721Pools.length) {
        const quotes = await api.multiCall({ abi: 'address:quoteTokenAddress', calls: erc721Pools, permitFailure: true });
        erc721Pools.forEach((pool, i) => ownerTokens.push([[quotes[i]].filter(Boolean), pool]));
    }

    return sumTokens2({ ownerTokens, api, permitFailure: true });
}

async function getBorrowed(chain, api) {
    const { erc20Pools, erc721Pools } = await getPools(chain, api);
    const pools = [...erc20Pools, ...erc721Pools];
    const debts = await api.multiCall({ abi: 'function debtInfo() external view returns (uint256, uint256, uint256, uint256)', calls: pools, permitFailure: true });
    const borrows = await api.multiCall({ abi: 'address:quoteTokenAddress', calls: pools, permitFailure: true });
    const borrowScale = await api.multiCall({ abi: 'uint:quoteTokenScale', calls: pools, permitFailure: true });
    const balances = {};
    pools.forEach((_, i) => {
        if (!debts[i] || !borrows[i] || !borrowScale[i]) return;
        // debtInfo()[0] is the current total pool debt in WAD; dividing by
        // quoteTokenScale (10^(18-decimals)) yields native quote-token units.
        sdk.util.sumSingleBalance(balances, borrows[i], debts[i][0] / borrowScale[i]);
    });
    return balances;
}

module.exports = Object.keys(factories).reduce((acc, chain) => {
    acc[chain] = {
        tvl: (api) => getTvl(chain, api),
        borrowed: (api) => getBorrowed(chain, api)
    };
    return acc;
}, {
    misrepresentedTokens: true,
    methodology: "TVL = collateral + available quote liquidity across all Ajna ERC20 and ERC721 pools (net of borrows). Borrowed = pool debtInfo. NFT-pool collateral is not priced.",
});
