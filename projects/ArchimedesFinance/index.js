const sdk = require('@defillama/sdk');
const curvePoolAbi = require('./curvePoolAbi.json');
const archimedesVaultAbi = require('./archimedesVaultAbi.json')
const ERC20_TOKEN_3CRV = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
const POOL_CONTRACT_LVUSD_3CRV = "0xe9123cbc5d1ea65301d417193c40a72ac8d53501";
const POOL_INDEX_3CRV = 1;
const ARCHIMEDES_VAULT_OUSD = "0x4c12c57C37Ff008450A2597e810B51B2BbA0383A";
const ERC20_TOKEN_OUSD = "0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86";

async function tvl(_, _1, _2, { api }) {
    const balances = {};

    // 3CRV liquidity in LVUSD-3CRV curve pool
    const { output: poolLiquidity3CRV } = await sdk.api.abi.call({
        target: POOL_CONTRACT_LVUSD_3CRV,
        abi: curvePoolAbi.balances,
        params: POOL_INDEX_3CRV
    });

    await sdk.util.sumSingleBalance(balances, ERC20_TOKEN_3CRV, poolLiquidity3CRV);

    // Total OUSD held in vault
    const { output: totalAssetsOUSD } = await sdk.api.abi.call({
        target: ARCHIMEDES_VAULT_OUSD,
        abi: archimedesVaultAbi.totalAssets
    });

    await sdk.util.sumSingleBalance(balances, ERC20_TOKEN_OUSD, totalAssetsOUSD);

    return balances;
}

module.exports = {
    methodology: 'total 3CRV liquidity in curve pool + total OUSD assets in protocol vault.',
    ethereum: {
        tvl: tvl,
    }
};