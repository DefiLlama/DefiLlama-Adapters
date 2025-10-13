/**
 * Endur is a liquid staking solution for STRK
 */

const {multiCall} = require("../helper/chain/starknet");
const { ERC4626AbiMap } = require('./erc4626abi')
const { LSTDATA } = require("./utils")

// returns the tvl of the all LST tokens in terms of their native token 
async function tvl(api) {
    const totalAssets = await multiCall({
        calls: LSTDATA.map(c => c.address),
        abi: ERC4626AbiMap.total_assets
    });
    // the balance of the tokens will be xTOKEN 
    // considering all 1 TOKEN = 1xTOKEN
    // eg for now we have xSTRK, xtBTC, xLBTC, xsolvBTC

    api.addTokens(LSTDATA.map(c => c.token), totalAssets);
}

module.exports = {
    doublecounted: true,
    methodology: "The TVL is the total staked STRK managed by Endur's LST",
    starknet: {
        tvl,
    },
};