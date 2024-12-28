/**
 * Buy or sell futures powered by Pythagorean bonding curves.
 *
 * @see https://pyth.ooo/
 * @see https://pyth.ooo/faq
 */

const { fetchBaseAABalances, fetchOswapExchangeRates, fetchOswapAssets, summingBaseAABalancesToTvl } = require('../helper/chain/obyte')

const BASE_AA = "A336I77COVXUCN3L2YOYVIZF7PKMFCAV";
const STAKING_BASE_AA = "HPJQ6ZCB2T3JTIVAMDM5QESZWNJNJERO";

// TODO support time travel for the exchange rate, currently it always returns the latest rates
async function tvl({ timestamp }) {
    const [exchangeRates, assetMetadata] = await Promise.all([
        fetchOswapExchangeRates(),
        fetchOswapAssets()
    ])

    const baseAASumBalances = await Promise.all([
        fetchBaseAABalances(timestamp, BASE_AA),
    ]).then(baseAABalances => {
        return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
    });

    const stakingBaseAASumBalances = await Promise.all([
        fetchBaseAABalances(timestamp, STAKING_BASE_AA),
    ]).then(baseAABalances => {
        return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
    });

    return baseAASumBalances + stakingBaseAASumBalances;
}

module.exports = {
    timetravel: false,
        misrepresentedTokens: true,
    methodology:
        "The TVL is the USD value of the assets locked into the autonomous agents that implement the Pythagorean protocol.",
    obyte: {
        fetch: tvl
    },
    fetch: tvl
}
