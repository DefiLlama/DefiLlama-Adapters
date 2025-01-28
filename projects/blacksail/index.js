const { getConfig } = require('../helper/cache');
const { get } = require('../helper/http')
const { getEnv } = require('../helper/env')
const { sumUnknownTokens } = require('../helper/unknownTokens')

async function fetcher() {
    const { data: { yield } } = await get('https://api.blacksail.finance/stats', {
        headers: {
            'x-api-key': getEnv('BLACKSAIL_API_KEY'),
            'Content-Type': 'application/json'
        }
    });
    return Object.values(yield).map((i) => i.strat_address).filter(i => i)
}

async function tvl(api) {
    let strats = (await api.multiCall({ abi: 'address:staking_token', calls: strats, permitFailure: true })).map((v, i) => v ? strats[i] : null).filter(i => i)
    
    const balances = (await api.multiCall({ abi: 'uint256:balanceOf', calls: strats }))
    const stakingTokens = await api.multiCall({ abi: 'address:staking_token', calls: strats })
    const ichiVaults = []
    const ichiBals = []

    // Helper function to check if a vault is an ICHI Vault by verifying the presence of ichiVaultFactory()
    const isIchiVault = async (token) => {
        try {
            await api.call({
                target: token,
                abi: 'function ichiVaultFactory() view returns (address)'
            });
            return true; // It is an ICHI Vault if ichiVaultFactory exists
        } catch (error) {
            return false; // It is not an ICHI Vault if the function is not found
        }
    };

    // Loop through each staking token and classify it as ICHI Vault or regular LP
    for (let i = 0; i < stakingTokens.length; i++) {
        const token = stakingTokens[i];
        const isIchi = await isIchiVault(token); // Check if the token is an ICHI Vault
        if (isIchi) {
            ichiVaults.push(token);
            ichiBals.push(balances[i]);
        } else {
            api.add(token, balances[i]);
        }
    }

    console.log("test")

    // resolve ichi vaults
    const iSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: ichiVaults })
    const iToken0s = await api.multiCall({ abi: 'address:token0', calls: ichiVaults })
    const iToken1s = await api.multiCall({ abi: 'address:token1', calls: ichiVaults })
    const iTokenBals = await api.multiCall({ abi: 'function getTotalAmounts() view returns (uint256 bal1, uint256 bal2)', calls: ichiVaults })

    iSupplies.map((_, i) => {
        const token0 = iToken0s[i]
        const token1 = iToken1s[i]
        const ratio = ichiBals[i] / iSupplies[i]
        api.add(token0, iTokenBals[i].bal1 * ratio)
        api.add(token1, iTokenBals[i].bal2 * ratio)
    })

    return sumUnknownTokens({ api, useDefaultCoreAssets: true, lps: stakingTokens, resolveLP: true, })
}

module.exports = {
    sonic: {
        tvl,
    }
}