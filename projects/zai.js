const sdk = require("@defillama/sdk");

async function tvl() {
    return {};
};

async function staking(timestamp, block) {
    const zaiBalance = (await sdk.api.erc20.balanceOf({
        block,
        target: '0xe420bce9109365Eae3bA6EBf24E5045B72388025',
        owner: '0xE2612091Ec3dBE6f40BbfD0f30e3b8E4eA896e53'
    })).output;
    return { '0x9d1233cc46795e94029fda81aaadc1455d510f15': zaiBalance };
};

module.exports = {
    ethereum: {
        tvl,
        staking
    }
};