const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require('./helper/unwrapLPs');
const zaiV1 = '0x9d1233cc46795e94029fda81aaadc1455d510f15';
const zaiV2 = '0xe420bce9109365eae3ba6ebf24e5045b72388025';
const zaiLP = '0x675a8fa1cf8a9c3bf2c49ff14fdcaa01b11dd842';

async function tvl() {
    return {};
};

async function staking(timestamp, block) {
    const zaiBalance = (await sdk.api.erc20.balanceOf({
        block,
        target: zaiV2,
        owner: '0xE2612091Ec3dBE6f40BbfD0f30e3b8E4eA896e53'
    })).output;
    return { [zaiV1]: zaiBalance };
};

async function pool2(timestamp, block) {
    let balances = {};
    const lpBalance = (await sdk.api.erc20.balanceOf({
        block,
        target: zaiLP,
        owner: '0x326E906A28Cd7fF56cCe6A84a8043786B8762cDf'
    })).output;

    await unwrapUniswapLPs(
        balances, 
        [{ balance: lpBalance, token: zaiLP }], 
        block
        );

    balances[zaiV1] = balances[zaiV2];
    delete balances[zaiV2];

    return balances;
};
module.exports = {
    ethereum: {
        tvl,
        staking,
        pool2
    }
};