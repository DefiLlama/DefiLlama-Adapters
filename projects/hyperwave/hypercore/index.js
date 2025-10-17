const { post } = require('../../helper/http');
const { sumUnknownTokens } = require('../../helper/unknownTokens');
const { ADDRESSES, MS_ALL, HLP_VAULT, DELAY, HYPER_CORE_TOKENS } = require('../constants');

/**
 * Add delay between API requests to avoid rate limiting
 */
const delay = () => new Promise(res => setTimeout(res, DELAY));

/**
 * Calculate TVL from HyperLiquid HLP vault positions
 */
async function hypercoreHwhlpVaultTvl(api) {
    const datas = [];
    
    for (const eoa of MS_ALL) {
        await delay();
        console.log(`Fetching vault data for ${eoa}`);
        datas.push(await post('https://api.hyperliquid.xyz/info', { 
            type: "userVaultEquities", 
            user: eoa 
        }));
        console.log(`Fetched vault data for ${eoa}`);
    }
    
    const hlpVaults = datas.flatMap(data => 
        data.filter(v => v.vaultAddress.toLowerCase() === HLP_VAULT.toLowerCase())
    );
    const hlpEquities = hlpVaults.map(v => parseFloat(v.equity));
    const hlpEquityUpscaled = hlpEquities.reduce((sum, equity) => sum + equity * 1e6, 0); // Convert to wei
    
    api.addTokens([ADDRESSES.arbitrum.USDC_CIRCLE], [hlpEquityUpscaled]);

    return sumUnknownTokens({ api, useDefaultCoreAssets: true });
}

/**
 * Calculate TVL from HyperCore spot balances
 */
async function hyperCoreSpotBalance(api) {
    const datas = [];
    
    for (const eoa of MS_ALL) {
        await delay();
        console.log(`Fetching spot balance for ${eoa}`);
        datas.push(await post('https://api.hyperliquid.xyz/info', { 
            type: "spotClearinghouseState", 
            user: eoa 
        }));
        console.log(`Fetched spot balance for ${eoa}`);
    }
    
    const balances = datas.flatMap(data => data.balances);
    const coinTotals = {};
    
    for (const b of balances) {
        if (!coinTotals[b.coin]) coinTotals[b.coin] = 0;
        coinTotals[b.coin] += parseFloat(b.total);
    }
    
    console.log(coinTotals);
    
    // Adding other core tokens
    const tokens = HYPER_CORE_TOKENS.map(t => t.address);
    const amounts = HYPER_CORE_TOKENS.map(t => 
        coinTotals[t.symbol] ? coinTotals[t.symbol] * 10 ** t.decimals : 0
    );
    console.log('Adding tokens:', tokens, 'with amounts:', amounts);
    api.addTokens(tokens, amounts);

    // Adding USDC balance
    const usdcBalance = coinTotals['USDC'] ? coinTotals['USDC'] : 0; // USDC is in 6 decimals
    api.addUSDValue(usdcBalance);

    return sumUnknownTokens({ api, useDefaultCoreAssets: true });
}

module.exports = {
    hypercoreHwhlpVaultTvl,
    hyperCoreSpotBalance,
};