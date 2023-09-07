const { contracts } = require("./constants");
const { getVaultTokenBalance, get4626VaultToken, getStrategyVaultValues, getVaultToken } = require("./helper");

const chainHelper = () => {
    /** find balance of vault's underlying assets (excl. lp & positions)  */
    const getUnderlyingTokenBalance = async (api, vaultAddresses) => {
        const vaultTokens = await getVaultToken(api, vaultAddresses);
        const vaultTokenBalances = await getVaultTokenBalance(api, vaultTokens, vaultAddresses);
        api.addTokens(vaultTokens, vaultTokenBalances);
        return;
    }

    // find the strategy's vault's lp value
    const getStrategyVaultsLpValue = async (api, vaultAddresses) => {
        const vaultTokens = await get4626VaultToken(api, vaultAddresses);
        const vaultTokenBalances = await getVaultTokenBalance(api, vaultTokens, vaultAddresses);
        api.addTokens(vaultTokens, vaultTokenBalances);
        const [tokens, balances] = await getStrategyVaultValues(api, vaultAddresses);
        api.addTokens(tokens, balances);
        return;
    }

    const aggregateVaultTvl = async (api) => {
        const { vaults, strategies } = contracts[api.chain];
        await getUnderlyingTokenBalance(api, vaults);
        await getStrategyVaultsLpValue(api, strategies);

        return api.getBalances();
    }

    const tvl = async (_, _1, _2, { api }) => {
        await aggregateVaultTvl(api);
        return api.getBalances();
    }

    return {
        tvl,
    }
}

module.exports = {
    start: 1693929600, // Tue Sep 05 2023 16:00:00 GMT+0000
    methodology: 'Hodlify TVL including total values of assets deposited in other protocols, and the petty cash in our earning vaults.',
    arbitrum: chainHelper('arbitrum'),
    optimism: chainHelper('optimism'),
    polygon: chainHelper('polygon'),
}