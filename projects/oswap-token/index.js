/**
 * OSWAP token is designed to reflect the success
 * of Oswap protocol — with greater total value locked (TVL) 
 * in all pools of Oswap DEX the token appreciates faster, and 
 * with lower TVL it appreciates slower.
 *
 * @see https://token.oswap.io/
 *
 */

const { getAaStateVars, executeGetter } = require('../helper/chain/obyte')

const AA_ADDRESS = "OSWAPWKOXZKJPYWATNK47LRDV4UN4K7H";

const GBYTE_DECIMALS = 9;
const OSWAP_TOKEN_DECIMALS = 9;

async function tvl() {
    const state = await getAaStateVars(AA_ADDRESS, "state").then(({ state }) => state || {});
    const tokenReserveTVL = state?.reserve || 0;

    return { 'byteball': tokenReserveTVL / 10 ** GBYTE_DECIMALS }
}

async function staking() {
    const state = await getAaStateVars(AA_ADDRESS, "state").then(({ state }) => state || {});
    const totalStakedBalance = state?.total_staked_balance || 0;
    let oswapTokenPrice = 0;
    try {
        oswapTokenPrice = await executeGetter(AA_ADDRESS, "get_price");
    } catch (e) {
        // The AA's get_price getter has been reverting since Aug 2026 ("invalid appreciation coef multiplier"):
        // no trade has touched the AA for months and its reserve is down to 1 byte, so the token is effectively
        // worthless. Fall back to 0 instead of failing the whole adapter.
        if (!e.response?.data?.error?.message?.includes('appreciation coef')) throw e;
    }
    const totalStakedTVL = (totalStakedBalance / 10 ** OSWAP_TOKEN_DECIMALS) * oswapTokenPrice;

    return { 'byteball': totalStakedTVL }
}

module.exports = {
    timetravel: false,
        misrepresentedTokens: true,
    methodology:
        "The TVL is the USD value of the all assets locked on the OSWAP token autonomous agent. This includes the reserve asset used to issue the OSWAP tokens and OSWAP tokens locked in governance (as staking).",
    obyte: {
        tvl,
        staking
    },
}
