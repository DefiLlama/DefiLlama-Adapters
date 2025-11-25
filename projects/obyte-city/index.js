/*
 * Obyte City — A community engagement space for Obyte
 * A community engagement space where Obyte community members establish closer
 * connections with each other and receive rewards after becoming neighbors in the City
 * @see https://city.obyte.org
 */
const {
    getBalances,
    fetchOswapExchangeRates,
    fetchOswapAssets,
    getDecimalsByAsset,
    executeGetter,
    getAaStateVars,
} = require('../helper/chain/obyte')

const CITY_AA_ADDRESS = 'CITYC3WWO5DD2UM6HQR3H333RRTD253Q'

async function totalTvl() {
    const [assetMetadata, exchangeRates, balances] = await Promise.all([
        fetchOswapAssets(),
        fetchOswapExchangeRates(),
        getBalances([CITY_AA_ADDRESS]).then((balances) => balances[CITY_AA_ADDRESS])
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

async function totalStaking() {
    const [
        depositedSupply,
        exchangeRates,
        constants
    ] = await Promise.all([
        executeGetter(CITY_AA_ADDRESS, 'get_deposited_supply', []),
        fetchOswapExchangeRates(),
        getAaStateVars(CITY_AA_ADDRESS, 'constants').then(vars => vars?.constants)
    ]);

    const decimals = await getDecimalsByAsset(constants.asset);

    const price = exchangeRates[`${constants.asset}_USD`];
    const staked = price * (depositedSupply / 10 ** decimals);

    return { tether: staked }
}


module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    methodology:
        "The TVL is the total USD-value of funds locked in the agent of the CITY platform",
    obyte: {
        tvl: totalTvl,
        staking: totalStaking,
    }
}
