/*
 * Cascading donations to github repositories
 *
 * Support open-source projects with donations in crypto, and they will automatically
 * forward a part of your donation to other open-source projects that made them possible.
 *
 * @see https://kivach.org/
 */
const {
    getBalances,
    fetchOswapExchangeRates,
    fetchOswapAssets,
    getDecimalsByAsset,
} = require('../helper/chain/obyte')

const KIVACH_AA_ADDRESS = 'D3B42CWMY3A6I6GHC6KUJJSUKOCBE77U'

async function totalTvl() {
    const [assetMetadata, exchangeRates, balances] = await Promise.all([
        fetchOswapAssets(),
        fetchOswapExchangeRates(),
        getBalances([KIVACH_AA_ADDRESS]).then((balances) => balances[KIVACH_AA_ADDRESS])
    ]);

    const assetDecimals = {};
    const decimalGetters = [];

    Object.keys(balances).forEach((asset) => {
        const decimals = assetMetadata[asset]?.decimals;

        if (decimals !== undefined) {
            assetDecimals[asset] = decimals;
        } else {
            decimalGetters.push(getDecimalsByAsset(asset).then((decimals) => assetDecimals[asset] = decimals))
        }
    });

    await Promise.all(decimalGetters);

    let tvl = 0;

    Object.entries(balances).forEach(async ([asset, { stable: balance = 0 }]) => {
        const assetKey = (asset === "base") ? "GBYTE" : asset;
        const usdRate = exchangeRates[`${assetKey}_USD`] ?? 0;
        const decimals = assetDecimals[asset];

        if (decimals !== undefined) {
            tvl += (balance / 10 ** decimals) * usdRate;
        }
    });

    return { tether: tvl }
}

module.exports = {
    timetravel: false,
        misrepresentedTokens: true,
    methodology:
        "The TVL is the USD value of all undistributed donations received through Kivach.",
    obyte: {
        tvl: totalTvl
    }
}
