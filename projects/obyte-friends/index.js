/*
 * Obyte Friends — Make 1% a day by making friends every day and spreading the word 
 * about Obyte’s unstoppable, censorship-resistant tech
 * @see https://friends.obyte.org
 */
const {
    getBalances,
    getAaStateVars,
    getDecimalsByAsset,
    executeGetter
} = require('../helper/chain/obyte')

const FRIENDS_AA_ADDRESS = 'FRDOT24PXLEY4BRGC7WPMSKXUWUFMUMG'
const GBYTE_DECIMALS = 9;
const GBYTE_ASSET = 'base';

async function totalTvl() {
    const [balances, frdAsset] = await Promise.all([
        getBalances([FRIENDS_AA_ADDRESS]).then(res => res[FRIENDS_AA_ADDRESS]),
        getAaStateVars(FRIENDS_AA_ADDRESS, 'constants').then(vars => vars?.constants?.asset)
    ]);

    const gbyteBalance = balances[GBYTE_ASSET]?.total || 0; // base asset is GBYTE

    const tvl = {
        byteball: gbyteBalance / 10 ** GBYTE_DECIMALS // byteball is GBYTE in coingecko
    };

    for (const [asset, balance] of Object.entries(balances)) {
        if (asset === frdAsset) continue;
        if (asset === GBYTE_ASSET) continue;

        const decimals = await getDecimalsByAsset(asset);

        tvl[asset] = balance.total / 10 ** decimals;
    }

    return tvl;
}

async function totalStaking() {
    const [
        depositedSupply,
        constants
    ] = await Promise.all([
        executeGetter(FRIENDS_AA_ADDRESS, 'get_deposited_supply', []),
        getAaStateVars(FRIENDS_AA_ADDRESS, 'constants').then(vars => vars?.constants)
    ]);

    const decimals = await getDecimalsByAsset(constants.asset);

    return { [constants.asset]: depositedSupply / 10 ** decimals }
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    methodology:
        "The TVL is the total USD-value of funds locked in the agent of the Obyte Friends platform.",
    obyte: {
        tvl: totalTvl,
        staking: totalStaking,
    }
}
