const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs');

const poolFactories = {
    ethereum: '0x6146DD43C5622bB6D12A5240ab9CF4de14eDC625',
    arbitrum: '0xA3A1e968Bd6C578205E11256c8e6929f21742aAF',
    avax: '0x2aA2A6e6B4b20f496A4Ed65566a6FD13b1b8A17A',
    base: '0x214f62B5836D83f3D6c4f71F174209097B1A779C',
    blast: '0xcfCB7fb8c13c7bEffC619c3413Ad349Cbc6D5c91',
    bsc: '0x86eE95085F204B525b590f21dec55e2373F6da69',
    filecoin: '0x0E4a2276Ac259CF226eEC6536f2b447Fc26F2D8a',
    hemi: '0xE47b3D287Fc485A75146A59d459EC8CD0F8E5021',
    linea: '0xd72A448C3BC8f47EAfFc2C88Cf9aC9423Bfb5067',
    mode: '0x62Cf5d9075D1d6540A6c7Fa836162F01a264115A',
    optimism: '0x609C4e8804fafC07c96bE81A8a98d0AdCf2b7Dfa',
    polygon: '0x1f172F881eBa06Aa7a991651780527C173783Cf6',
    rari: '0x10cE36851B0aAf4b5FCAdc93f176aC441D4819c9',
};

async function getTvl(poolFactory, api) {
    const pools = await api.call({ abi: 'address[]:getDeployedPoolsList', target: poolFactory });
    const collaterals = await api.multiCall({ abi: 'address:collateralAddress', calls: pools });
    const borrows = await api.multiCall({ abi: 'address:quoteTokenAddress', calls: pools });
    const ownerTokens = pools.map((v, i) => [[collaterals[i], borrows[i]], v]);
    return sumTokens2({ ownerTokens, api });
}

async function getBorrowed(poolFactory, api) {
    const pools = await api.call({ abi: 'address[]:getDeployedPoolsList', target: poolFactory });
    const debts = await api.multiCall({ abi: 'function debtInfo() external view returns (uint256, uint256, uint256, uint256)', calls: pools });
    const borrows = await api.multiCall({ abi: 'address:quoteTokenAddress', calls: pools });
    const borrowScale = await api.multiCall({ abi: 'uint:quoteTokenScale', calls: pools });
    const balances = {};
    pools.forEach((v, i) => sdk.util.sumSingleBalance(balances, borrows[i], debts[i][0]/borrowScale[i]));
    return balances;
}

module.exports.methodology = "We are not tracking this tokens: bfBTC and msBTC"

module.exports = Object.keys(poolFactories).reduce((acc, chain) => {
    acc[chain] = {
        tvl: (api) => getTvl(poolFactories[chain], api),
        borrowed: (api) => getBorrowed(poolFactories[chain], api)
    };
    return acc;
}, { misrepresentedTokens: true });
