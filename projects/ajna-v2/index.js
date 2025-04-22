const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs');

const poolFactories = {
    ethereum: '0x6146DD43C5622bB6D12A5240ab9CF4de14eDC625',
    arbitrum: '0x595c823EdAA612972d77aCf324C11F6284B9f5F6',
    base: '0x154FFf344f426F99E328bacf70f4Eb632210ecdc',
    optimism: '0x43cD60250CBBC0C22663438dcf644F5162988C06',
    polygon: '0x3D6b8B4a2AEC46961AE337F4A9EBbf283aA482AA',
    blast: '0xcfCB7fb8c13c7bEffC619c3413Ad349Cbc6D5c91',
    filecoin: '0x0E4a2276Ac259CF226eEC6536f2b447Fc26F2D8a',
    linea: '0xd72A448C3BC8f47EAfFc2C88Cf9aC9423Bfb5067',
    mode: '0x62Cf5d9075D1d6540A6c7Fa836162F01a264115A',
    rari: '0x10cE36851B0aAf4b5FCAdc93f176aC441D4819c9'
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

module.exports = Object.keys(poolFactories).reduce((acc, chain) => {
    acc[chain] = {
        tvl: (api) => getTvl(poolFactories[chain], api),
        borrowed: (api) => getBorrowed(poolFactories[chain], api)
    };
    return acc;
}, { misrepresentedTokens: true });
