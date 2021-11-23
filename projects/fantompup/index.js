const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0xCFD389eFCD11aB30933F46e493da08cE5ebAf233"
const fpup = "0x900825EA297c7c5D1F6fA54146849BC41EdDAf29"
const fPupFwingsFtmLP = "0xF0cE83239ac341941eDe0Fe9Acef8ae22d271709"
const fPupFwingsUsdcLP = "0xE2fA732C69F7Ca59944f8007d87c5906AFEb6b8F";
const fPupSpookyLP = "0xc2F40ba0cfdAe59E4E16727862C7a0f249fcAaF2";

async function tvl(timestamp, block, chainBlocks) {
    const balances = {}
    const transformAddress = await transformFantomAddress();
    await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [fpup, fPupFwingsFtmLP, fPupFwingsUsdcLP, fPupSpookyLP]);
    return balances;
}

module.exports = {
    methodology: "TVL includes all farms in MasterChef contract",
    fantom: {
        tvl,
        staking: staking(chef, fpup, "fantom"),
        pool2: pool2Exports(chef, [fPupFwingsFtmLP, fPupFwingsUsdcLP, fPupSpookyLP], "fantom"),
    },

}