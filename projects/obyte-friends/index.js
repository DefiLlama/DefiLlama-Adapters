/*
 * Obyte Friends — Make 1% a day by making friends every day and spreading the word 
 * about Obyte’s unstoppable, censorship-resistant tech
 * @see https://friends.obyte.org
 */
const {
    getBalances,
    fetchOswapExchangeRates,
    getDecimalsByAsset
} = require('../helper/chain/obyte')

const FRIENDS_AA_ADDRESS = 'FRDOT24PXLEY4BRGC7WPMSKXUWUFMUMG'

async function totalTvl() {
    const [rate, balances] = await Promise.all([
        fetchOswapExchangeRates(),
        getBalances([FRIENDS_AA_ADDRESS]).then(res => res[FRIENDS_AA_ADDRESS])
    ]);

    let totalTvl = 0;

    for (const [asset, balance] of Object.entries(balances)) {
        const decimals = await getDecimalsByAsset(asset);
        const tokenPrice = asset === 'base' ? rate['GBYTE_USD'] : rate[`${asset}_USD`];

        if (rate) {
            totalTvl += (balance.total / 10 ** decimals) * tokenPrice
        }
    }


    return { tether: totalTvl }
}


module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    methodology:
        "The TVL is the total USD-value of funds locked in the agent of the FRIENDS platform.",
    obyte: {
        tvl: totalTvl
    }
}
