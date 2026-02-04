const curvePoolAbi = {
    "balances": "function balances(uint256 arg0) view returns (uint256)"
  };
const archimedesVaultAbi = {
    "totalAssets": "function totalAssets() view returns (uint256)"
  };const ERC20_TOKEN_3CRV = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
const POOL_CONTRACT_LVUSD_3CRV = "0xe9123cbc5d1ea65301d417193c40a72ac8d53501";
const POOL_INDEX_3CRV = 1;
const ARCHIMEDES_VAULT_OUSD = "0x4c12c57C37Ff008450A2597e810B51B2BbA0383A";
const ERC20_TOKEN_OUSD = "0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86";

async function tvl(api) {
    // 3CRV liquidity in LVUSD-3CRV curve pool
    const poolLiquidity3CRV = await api.call({ target: POOL_CONTRACT_LVUSD_3CRV, abi: curvePoolAbi.balances, params: POOL_INDEX_3CRV });

    // Total OUSD held in vault
    const totalAssetsOUSD = await api.call({ target: ARCHIMEDES_VAULT_OUSD, abi: archimedesVaultAbi.totalAssets });

    api.add(ERC20_TOKEN_3CRV, poolLiquidity3CRV)
    api.add(ERC20_TOKEN_OUSD, totalAssetsOUSD)
}

module.exports = {
    methodology: 'total 3CRV liquidity in curve pool + total OUSD assets in protocol vault.',
    ethereum: {
        tvl: tvl,
    }
};