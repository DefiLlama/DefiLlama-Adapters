const sdk = require('@defillama/sdk')
const {sumTokens} = require('../helper/unwrapLPs')

const yfdaiTokenAddress = "0xf4CD3d3Fda8d7Fd6C5a500203e38640A70Bf9577";
const YfDaiStakingAdddress = "0x44d771D0C998f524ff39aB6Df64B72bce1d09566";
const YfDaiSafetradeStakingAddress = "0x4599cDa238Fb71573fd5A0076C199320e09BCfF0";
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const dai = "0x6b175474e89094c44da98b954eedeac495271d0f"
const wethVault = "0x290e5484601986667dC6cA72119f2B85260Ca92E"
const daiVault = "0x7e537E8B5028a32166F06C8664cdE9D608487428"
const YfDaiETHLP72HRSVault = "0x75E9F410e8d1D7240b67ec6FE35FA37580b814d9";
const YfDaiETHLP30DayVault = "0x8D704D4107CBE5ebE8c0236C5506b30Bf8Bad305";
const YfDaiETHLP60DayVault = "0x26572bf2620108cb5006987e6348c07dc4e14a0f";
const YfDaiETHLP90DayVault = "0x175d6cbaeff93734ada4c5430815f2208a6b040c";
const impulsevenStakingAddress = "0xc0c135D29ba6BB1Ca5F88571A0c45807C3015c64";

async function eth(_timestamp, ethBlock, chainBlocks) {
    const balances = {}
  await sumTokens(balances, [
    [yfdaiTokenAddress, YfDaiSafetradeStakingAddress],
    [weth, wethVault],
    [dai, daiVault],
  ], ethBlock)
  return balances
}

async function staking(_timestamp, ethBlock, chainBlocks) {
    const balances = {}
  await sumTokens(balances, [
    [yfdaiTokenAddress, YfDaiETHLP72HRSVault],
    [yfdaiTokenAddress, YfDaiETHLP30DayVault],
    [yfdaiTokenAddress, YfDaiETHLP60DayVault],
    [yfdaiTokenAddress, YfDaiETHLP90DayVault],
    [yfdaiTokenAddress, impulsevenStakingAddress],
    [yfdaiTokenAddress, YfDaiStakingAdddress]
  ], ethBlock)
  return balances
}


module.exports = {
    ethereum:{
        tvl: eth,
        staking
    },
}
