/**
 * OSWAP token is designed to reflect the success
 * of Oswap protocol — with greater total value locked (TVL) 
 * in all pools of Oswap DEX the token appreciates faster, and 
 * with lower TVL it appreciates slower.
 *
 * @see https://token.oswap.io/
 *
 */

const { getAaStateVars, fetchOswapExchangeRates, executeGetter, getDecimalsByAsset } = require('../helper/chain/obyte')

const PRESALE_AA_ADDRESS = "BBXAG2CZWC2IRH3UQF3O5A5USVDCSYTX";
const AA_ADDRESS = "OSWAPWKOXZKJPYWATNK47LRDV4UN4K7H";

const GBYTE_DECIMALS = 9;
const OSWAP_TOKEN_DECIMALS = 9;

async function tvl() {
    const presaleReserveTVL = await getAaStateVars(PRESALE_AA_ADDRESS, "total").then(({ total }) => total || 0); // in GBYTE
    const state = await getAaStateVars(AA_ADDRESS, "state").then(({ state }) => state || {});
    const exchangeRates = await fetchOswapExchangeRates();

    const poolsByAssetKey = await getAaStateVars(AA_ADDRESS, "pool_").then(async (stateVars) => {
        const poolsByAssetKey = {};

        Object.entries(stateVars).map(([varName, data]) => {

            const varNameSplit = varName.split("_");

            if (varNameSplit.length === 2) {
                const asset = varNameSplit[1];

                poolsByAssetKey[data.asset_key] = {
                    asset,
                    ...data,
                }
            }

        });

        return poolsByAssetKey;
    });

    const decimalGetters = Object.values(poolsByAssetKey).map(({ asset_key, asset }) => {
        return getDecimalsByAsset(asset).then((decimals) => {
            poolsByAssetKey[asset_key].decimals = decimals;
        });
    });

    await Promise.all(decimalGetters);

    const gbyteToUSD = exchangeRates["GBYTE_USD"] || 0;

    // Staked OSWAP tokens
    const totalStakedBalance = state?.total_staked_balance || 0;
    const oswapTokenPrice = await executeGetter(AA_ADDRESS, "get_price");
    const totalStakedTVLInUSD = (totalStakedBalance / 10 ** OSWAP_TOKEN_DECIMALS) * oswapTokenPrice * gbyteToUSD;

    // Reserve
    const tokenReserveTVL = state?.reserve || 0;
    const totalReserveTVL = presaleReserveTVL + tokenReserveTVL;
    const totalReserveTVLInUSD = (totalReserveTVL / 10 ** GBYTE_DECIMALS) * gbyteToUSD;

    // Staked LP tokens
    const stakedLpList = await getAaStateVars(AA_ADDRESS, "pool_asset_balance_");

    const totalLPStakedTVLInUSD = Object.entries(stakedLpList).reduce((prev, [key, balance]) => {
        const asset_key = key.split("_")[3];
        const pool = poolsByAssetKey[asset_key];

        if (pool) {
            const tokenPrice = exchangeRates[`${pool.asset}_USD`] || 0;
            const balanceInUSD = (balance / 10 ** pool.decimals) * tokenPrice;

            return prev + balanceInUSD;
        } else {
            return prev;
        }

    }, 0);

    return totalReserveTVLInUSD + totalStakedTVLInUSD + totalLPStakedTVLInUSD;
}

module.exports = {
    timetravel: false,
    doublecounted: false,
    misrepresentedTokens: true,
    methodology:
        "The TVL is the USD value of the all assets locked on the OSWAP token autonomous agent. This includes the reserve asset used to issue the OSWAP tokens, OSWAP tokens locked in governance, and LP tokens staked to receive rewards.",
    obyte: {
        fetch: tvl
    },
    fetch: tvl
}
