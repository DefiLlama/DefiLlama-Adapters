const sdk = require("@defillama/sdk");
const {staking} = require("../helper/staking");
const {unwrapUniswapLPs, sumTokens} = require("../helper/unwrapLPs")

const superfarm = "0xe53ec727dbdeb9e2d5456c3be40cff031ab40a55";
const superfarmStaking = "0xf35A92585CeEE7251388e14F268D9065F5206207";
const superEthUniLP = "0x25647e01bd0967c1b9599fa3521939871d1d0888";
const inj = "0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30";
const injStaking = "0x8e586D927acE36a3ef7bDDF9f899d2E385d5Fc9b";
const revv = "0x557B933a7C2c45672B610F8954A3deB39a51A8Ca";
const revvStaking = "0xb3EA98747440aDDC6A262735E71B5A5cB29edd80";

async function tvl(timestamp, block) {
    let balances = {};
    await sumTokens(balances, [
        [inj, injStaking],
        [revv, revvStaking]
    ], block)
    return  balances;
}

async function pool2(timestamp, block) {
    let balances = {};
    const lpBalance = (await sdk.api.erc20.balanceOf({
        target: superEthUniLP,
        owner: superfarmStaking,
        block
    })).output;
    await unwrapUniswapLPs(balances, [{
        token: superEthUniLP,
        balance: lpBalance
    }], block);
    return balances;
}

module.exports = {
    ethereum: {
        tvl,
        staking: staking(superfarmStaking, superfarm),
        pool2,
    }
}