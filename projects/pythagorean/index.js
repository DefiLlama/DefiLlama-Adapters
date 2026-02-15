/**
 * Buy or sell futures powered by Pythagorean bonding curves.
 *
 * @see https://pyth.ooo/
 * @see https://pyth.ooo/faq
 */

const { fetchBaseAABalances, fetchOswapExchangeRates, fetchOswapAssets, fetchOstableAssets } = require('../helper/chain/obyte')

const BASE_AA = "A336I77COVXUCN3L2YOYVIZF7PKMFCAV";
const STAKING_BASE_AA = "HPJQ6ZCB2T3JTIVAMDM5QESZWNJNJERO";

// Asset ID -> Coingecko ID
const ASSET_MAPPING = {
    "base": "byteball",
    "S/oCESzEO8G2hvQuI6HsyPr0foLfKwzs+GU73nO9H40=": "usd-coin",
};

async function tvl(api) {
    const timestamp = api.timestamp;
    const [exchangeRates, assetMetadata1, assetMetadata2] = await Promise.all([
        fetchOswapExchangeRates(),
        fetchOswapAssets(),
        fetchOstableAssets()
    ])

    const assetMetadata = { ...assetMetadata1, ...assetMetadata2 }

    const balancesList = await Promise.all([
        fetchBaseAABalances(timestamp, BASE_AA),
        fetchBaseAABalances(timestamp, STAKING_BASE_AA),
    ]);

    const processBalances = (balances) => {
        if (!balances || !balances.addresses) return;
        Object.values(balances.addresses).forEach(addressDetails => {
            Object.entries(addressDetails.assets || {}).forEach(([asset, assetDetails]) => {
                if (assetDetails.selfIssued) return;

                const balance = assetDetails.balance;
                if (ASSET_MAPPING[asset]) {
                    const decimals = assetMetadata[asset]?.decimals ?? (asset === 'base' ? 9 : 0);
                    api.add('coingecko:' + ASSET_MAPPING[asset], balance / Math.pow(10, decimals));
                } else {
                    // Fallback to current rates
                    const decimals = assetMetadata[asset]?.decimals ?? 0;
                    const baseCurrency = (asset === "base") ? "GBYTE" : asset;
                    const usdRate = exchangeRates[`${baseCurrency}_USD`] ?? 0;
                    const usdValue = balance / Math.pow(10, decimals) * usdRate;
                    api.addUSDValue(usdValue);
                }
            });
        });
    };

    balancesList.forEach(processBalances);
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology:
        "The TVL is the USD value of the assets locked into the autonomous agents that implement the Pythagorean protocol.",
    obyte: {
        tvl
    },
}
