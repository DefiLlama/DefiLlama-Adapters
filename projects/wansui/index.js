const sui = require("../helper/chain/sui");
const BigNumber = require('bignumber.js');

const CREATED_EVENT = "0xc4bb66da17fec7444b7b3e2ac750e35ea6225f5cca936c423fad2c78245d987c::suipump::Created";

/** @typedef {import("@defillama/sdk").ChainApi} ChainApi */
/**
 * @param {ChainApi} api 
 */
async function tvl(api) {
    const createdTokens = await sui.queryEvents({
        eventType: CREATED_EVENT,
        transform: e => {
            let tokenAddr = e.token_address
            if (!tokenAddr.startsWith("0x")) {
                tokenAddr = "0x" + tokenAddr
            }

            return {
                token: tokenAddr,
                bondingCurve: e.bonding_curve
            }
        }
    })

    const bondingCurveData = await sui.getObjects(createdTokens.map(t => t.bondingCurve))

    const suiDecimal = 6
    const balances = bondingCurveData.map(item => {
        // When created, bonding curve has 800M tokens to sell
        const initialAmount = new BigNumber(800_000_000).multipliedBy(10 ** suiDecimal)
        const tokenReserve = new BigNumber(item.fields.real_token_reserves)

        return initialAmount.minus(tokenReserve)
    })

    const tokens = createdTokens.map(t => t.token)

    api.addTokens(tokens, balances)
}

module.exports = {
    methodology: "We count the tokens that have been created by the bonding curve and subtract the amount of tokens that are still in the bonding curve.",
    sui: {
        tvl,
    },
}