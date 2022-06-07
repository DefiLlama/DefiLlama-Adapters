const { calculateUniTvl } = require("../helper/calculateUniTvl");
const { stakingUnknownPricedLP } = require("../helper/staking");
const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const token = "0x43C812Ba28cb061b1Be7514145A15C9E18a27342";
const stakingContract = "0x32A948F018870548bEd7e888Cd97a257b700D4c6";
const factory = "0xD9362AA8E0405C93299C573036E7FB4ec3bE1240"

async function getGtrPrice (block) {
    const chain = "avax";   
    const usdtBalance = (await sdk.api.erc20.balanceOf({
        target: "0xc7198437980c041c805a1edcba50c1ce5db95118",
        owner: "0x039b4C79916b7ACc953f0f67e6181842EFBE6e6e",
        block,
        chain
    })).output;
    const gtrBalance = (await sdk.api.erc20.balanceOf({
        target: "0x43C812Ba28cb061b1Be7514145A15C9E18a27342",
        owner: "0x039b4C79916b7ACc953f0f67e6181842EFBE6e6e",
        block,
        chain
    })).output;
    const gtrPrice = usdtBalance/gtrBalance;
    return gtrPrice
}

async function tvl(timestamp, block, chainBlocks) {
    let balances = await calculateUniTvl(addr=>`avax:${addr}`, chainBlocks.avax, "avax", factory, 0, true);
    const gtrPrice = await getGtrPrice(chainBlocks.avax);
    sdk.util.sumSingleBalance(balances, `avax:0x19860ccb0a68fd4213ab9d8266f7bbf05a8dde98`, BigNumber(balances["avax:0x43c812ba28cb061b1be7514145a15c9e18a27342"]).times(gtrPrice).times(10 ** 12).toFixed(0));
    delete balances["avax:0x43c812ba28cb061b1be7514145a15c9e18a27342"];
    return balances;
}

module.exports = {
    misrepresentedTokens: true,
    avalanche: {
        tvl,
        staking: stakingUnknownPricedLP(stakingContract, token, "avax", "0x039b4C79916b7ACc953f0f67e6181842EFBE6e6e")
    }
}