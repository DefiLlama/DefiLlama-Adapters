// increment liquid staking link: https://app.increment.fi/staking
const { post } = require('../helper/http')

let queryLiquidStakingTVLCode = `
import DelegatorManager from 0xd6f80565193ad727

access(all) fun main(): UFix64 {
    return DelegatorManager.getTotalValidStakingAmount()
}`;

const queryCodeBase64 = Buffer.from(queryLiquidStakingTVLCode, 'utf-8').toString('base64');

async function tvl() {
    try {
        const response = await post("https://rest-mainnet.onflow.org/v1/scripts", { "script": queryCodeBase64 }, {
            headers: { "content-type": "application/json" },
        });
        let resEncoded = response;
        // resString = {"type":"UFix64","value":"96014.17736711"}
        let resString = Buffer.from(resEncoded, 'base64').toString('utf-8');
        let resJson = JSON.parse(resString);
        let flowTokenTVL = Number(resJson.value);

        return { flow: flowTokenTVL };
    } catch (error) {
        throw new Error(`Couln't query scripts of increment liquid staking for flow chain`, error);
    }
}

module.exports = {
    timetravel: false,
    methodology: "Counting the flow tokens staked by users in the protocol, and tokens locked by unstaking are not counted.",
    flow: {
        tvl,
    },
};
