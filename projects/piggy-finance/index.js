const sdk = require("@defillama/sdk")
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const piggy = "0x1a877B68bdA77d78EEa607443CcDE667B31B0CdF";
const pshare = "0xa5e2cfe48fe8c4abd682ca2b10fcaafe34b8774c";
const pshareStaking = "0x4cCc31bfd4b32BFcb9bF148f44FB9CfE75c379AB";
const rewardPool = "0xA880Ab40395A6C00f0bf4c105bB7eAA06A8a1B62";

async function tvl (timestamp, block, chainBlocks) {
    let balances = {};
    await sumTokensAndLPsSharedOwners(balances, [
        ["0x2440885843d8e9f16a4b64933354d1CfBCf7F180", true], // PIGGY-WAVAX
        ["0x40128a19F97cb09f13cc370909fC82E69Bccabb1", true], // PSHARE-WAVAX
    ], [rewardPool], chainBlocks.avax, "avax", addr=>`avax:${addr}`);
    const pshareBalance = (await sdk.api.erc20.balanceOf({
        target: pshare,
        owner: pshareStaking,
        block: chainBlocks.avax,
        chain: "avax"
    })).output;
    sdk.util.sumSingleBalance(balances, `avax:${pshare}`, pshareBalance);
    return balances;
}

module.exports = {
    avalanche: {
        tvl,
    }
}