const { ADDRESS_PROVIDER_ADDRESS, ADDRESS_PROVIDER_ABI, REGISTRY_ABI, DVP_ABI, VAULT_ABI, ARBITRUM_USDC_ADDRESS, VAULT_STATE_ABI } = require('./constants');
const sdk = require('@defillama/sdk')

async function tvl(api) {
    let totalTvl = 0;
    const balances = {}

    // Step 1: Get the registry address from the AddressProvider contract.
    const registryAddress = await api.call({
        abi: ADDRESS_PROVIDER_ABI,
        target: ADDRESS_PROVIDER_ADDRESS,
        method: 'registry'
    });


    // Step 2: Get the list of DVP addresses from the registry
    const dvpAddresses = await api.call({
        abi: REGISTRY_ABI,
        target: registryAddress,
        method: 'getDVPs',
    });

    for (const dvpAddress of dvpAddresses) {
        // Step 2: For each DVP address, retrieve associated vault address
        const vaultAddress = await api.call({
            abi: DVP_ABI,
            target: dvpAddress,
            method: 'vault',
        });


        // Step 3: For each vault address, fetch balances and calculate TVL
        const notional = await api.call({
            abi: VAULT_ABI,
            target: vaultAddress,
            method: 'notional',
        });

        const vaultState = await api.call({
            abi: VAULT_STATE_ABI,
            target: vaultAddress,
            method: 'state',
        });

        const balance = Number(notional) + Number(vaultState.liquidity.pendingDeposits);
        sdk.util.sumSingleBalance(balances, `arbitrum:${ARBITRUM_USDC_ADDRESS}`, balance)
    }

    return balances;
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Sum of balances from vault contracts associated with each DVP retrieved by the registry.',
    start: 190367425,
    arbitrum: {
        tvl,
    }
};
