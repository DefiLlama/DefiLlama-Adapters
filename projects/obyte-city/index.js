/*
 * Obyte City — A community engagement space for Obyte
 * A community engagement space where Obyte community members establish closer
 * connections with each other and receive rewards after becoming neighbors in the City
 * @see https://city.obyte.org
 */
const {
    getBalances,
    fetchOswapExchangeRates,
    getDecimalsByAsset,
    executeGetter,
    getAaStateVars,
} = require('../helper/chain/obyte')

const CITY_AA_ADDRESS = 'CITYC3WWO5DD2UM6HQR3H333RRTD253Q'
const GBYTE_DECIMALS = 9;

async function totalTvl() {
    return { tether: 0 }
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
        "The TVL is the total USD-value of GBYTE funds locked in the agent of the CITY platform. Staking represents the USD-value of deposited CITY tokens.",
    obyte: {
        tvl: totalTvl,
        staking: totalStaking,
    }
}
