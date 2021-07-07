const sdk = require('@defillama/sdk')

const yfdaiTokenAddress = "0xf4CD3d3Fda8d7Fd6C5a500203e38640A70Bf9577";
const YfDaiStakingAdddress = "0x44d771D0C998f524ff39aB6Df64B72bce1d09566";
const YfDaiSafetradeStakingAddress = "0x4599cDa238Fb71573fd5A0076C199320e09BCfF0";

async function eth(_timestamp, ethBlock, chainBlocks) {
    return {
        [yfdaiTokenAddress]: (await sdk.api.erc20.balanceOf({
            target: yfdaiTokenAddress,
            owner: YfDaiSafetradeStakingAddress,
            block: ethBlock
        })).output
    }
}

async function staking(_timestamp, ethBlock, chainBlocks) {
    return {
        [yfdaiTokenAddress]: (await sdk.api.erc20.balanceOf({
            target: yfdaiTokenAddress,
            owner: YfDaiStakingAdddress,
            block: ethBlock
        })).output
    }
}


module.exports = {
    ethereum:{
        tvl: eth,
        staking
    },
    staking:{
        tvl: staking
    },
    tvl: eth,
}
