const { sumTokens2 } = require('../helper/unwrapLPs');

const poolFactories = {
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
    rari: { erc20: '0x10cE36851B0aAf4b5FCAdc93f176aC441D4819c9' },
};

async function getPoolsAndBorrowTokens(api) {
    const { erc20, erc721 } = poolFactories[api.chain]
    const poolLists = await api.multiCall({ abi: 'address[]:getDeployedPoolsList', calls: [erc20, erc721].filter(Boolean) });
    const pools = poolLists.flat();
    const borrows = await api.multiCall({ abi: 'address:quoteTokenAddress', calls: pools });
    return { pools, borrows };
}

async function tvl(api) {
    const { pools, borrows } = await getPoolsAndBorrowTokens(api);
    const collaterals = await api.multiCall({ abi: 'address:collateralAddress', calls: pools });
    const ownerTokens = pools.map((v, i) => [[collaterals[i], borrows[i]], v]);
    return sumTokens2({ ownerTokens, api, permitFailure: true });
}

async function borrowed(api) {
    const { pools, borrows } = await getPoolsAndBorrowTokens(api);
    const debts = await api.multiCall({ abi: 'function debtInfo() external view returns (uint256, uint256, uint256, uint256)', calls: pools });
    const borrowScale = await api.multiCall({ abi: 'uint:quoteTokenScale', calls: pools });
    pools.forEach((v, i) => api.add(borrows[i], debts[i][0] / borrowScale[i]));
}

module.exports.methodology = "We are not tracking this tokens: bfBTC and msBTC"

Object.keys(poolFactories).forEach(chain => {
    module.exports[chain] = { tvl, borrowed }
})