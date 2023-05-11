const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x0a53F16a00c593cbe5F6C890E751338396FE680f"
const spect = "0x2834d4F4cC40bd7D78c07E2D848358364222C272"
const spectFtmLP = "0x5547F5851f07dA5D98F14A36faAB1a53Bb272700"
const spectUsdcLP = "0xb326bbaC9Ca368FF20D0Fe1a51fF25f5F9C1E310";

async function tvl(timestamp, block, chainBlocks) {
    const balances = {}
    const transformAddress = await transformFantomAddress();
    await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [spect, spectFtmLP, spectUsdcLP]);
    return balances;
}

module.exports = {
    methodology: "TVL includes all farms in MasterChef contract",
    fantom: {
        tvl,
        staking: staking(chef, spect, "fantom"),
        pool2: pool2Exports(chef, [spectFtmLP, spectUsdcLP], "fantom"),
    },

}