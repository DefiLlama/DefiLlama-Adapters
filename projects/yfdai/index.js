const sdk = require('@defillama/sdk')
const {sumTokens} = require('../helper/unwrapLPs')

const yfdaiTokenAddress = "0xf4CD3d3Fda8d7Fd6C5a500203e38640A70Bf9577";
const YfDaiStakingAdddress = "0x44d771D0C998f524ff39aB6Df64B72bce1d09566";
const YfDaiSafetradeStakingAddress = "0x4599cDa238Fb71573fd5A0076C199320e09BCfF0";
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const dai = "0x6b175474e89094c44da98b954eedeac495271d0f"
const wethVault = "0x290e5484601986667dC6cA72119f2B85260Ca92E"
const daiVault = "0x7e537E8B5028a32166F06C8664cdE9D608487428"

async function eth(_timestamp, ethBlock, chainBlocks) {
    const balances = {}
  await sumTokens(balances, [
    [yfdaiTokenAddress, YfDaiSafetradeStakingAddress],
    [weth, wethVault],
    [dai, daiVault]
  ], ethBlock)
  return balances
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
