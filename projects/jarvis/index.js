const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

// The synthpoolRegistry addresses can be found in this repo
// https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/dev/libs/contracts/networks
const contracts = {
  polygon: { // 137
    version: 6, synthpoolRegistry: '0xA5BB18ca30fB27045ec0aA4d7039Fc37a7A03BD1',
    fixedRateVersion: 1, fixedRateRegistry: '0xBdE9c05FeA7a7fB1173024eac529a9c46bD0307f'
  },
  bsc: { // 56
    version: 5, synthpoolRegistry: '0x930A54D8Af945F6D1BED5AAF63b63fAb50a8197f',
    fixedRateVersion: 1, fixedRateRegistry: '0x80eB7668AEC208af0dA10F8BB70ca99F3604E076'
  },
  xdai: { // 100
    version: 5, synthpoolRegistry: '0x43a98e5C4A7F3B7f11080fc9D58b0B8A80cA954e',
  },
  optimism: { // 10
    version: 6, synthpoolRegistry: '0x811F78b7d6bCF1C0E94493C2eC727B50eE32B974',
  },
  avax: {
    version: 5, synthpoolRegistry: '0x8FEceC5629EED60D18Fd3438aae4a8E69723D190',
  }
}

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const { synthpoolRegistry, version } = contracts[chain]
    const { fixedRateRegistry, fixedRateVersion } = contracts[chain]
    const block = chainBlocks[chain]
    const balances = {}

    // Get liquidityPools by calling getElements(synth, collateral, version)
    // For v5, the collateral is stored in the liquidity pools directly
    // Get collaterals, usually single collat, USDC on polygon, BUSD on BSC, but might be multiple collats later on
    
    const { output: collaterals } = await sdk.api.abi.call({
      abi: abi["SynthereumPoolRegistry_getCollaterals"],
      target: synthpoolRegistry,
      block,
      chain
    })
    // Get synth token symbols - jEUR, jCHF etc
    const { output: syntheticTokens } = await sdk.api.abi.call({
      abi: abi["SynthereumPoolRegistry_getSyntheticTokens"],
      target: synthpoolRegistry,
      block,
      chain
    })
    if (chain === 'polygon' || chain === 'bsc') {
      // Get collateral for SynthereumFixedRate Wrappers
      const { output: fixedRateCollaterals } = await sdk.api.abi.call({
        abi: abi["SynthereumFixedRateRegistry_getCollaterals"],
        target: fixedRateRegistry,
        block,
        chain
      })

      // Get synthTokens for SynthereumFixedRate Wrappers - jEUR, jCHF etc.
      const { output: fixedRateSynthTokens } = await sdk.api.abi.call({
        abi: abi["SynthereumFixedRateRegistry_getSyntheticTokens"],
        target: fixedRateRegistry,
        block,
        chain
      })

      // Get fixedRateWrappers by calling SynthereumFixedRateRegistry_getElements
      const params_list_fixedRate = fixedRateCollaterals.map(fixedRateCollateral => fixedRateSynthTokens.map(fixedRateSynth => [fixedRateSynth, fixedRateCollateral, fixedRateVersion])).flat()
      const { output: elements_obj_fixedRate } = await sdk.api.abi.multiCall({
        abi: abi["SynthereumFixedRateRegistry_getElements"],
        calls: params_list_fixedRate.map(params => ({
          target: fixedRateRegistry,
          params: params
        })),
        block,
        chain
      })
      const fixedRateWrappers = elements_obj_fixedRate.map(e => e.output).flat(2)
      const fixedRateCalls = fixedRateWrappers.map(f => ({ target: f }))
      const { output: fixedRateCollateralTokens } = await sdk.api.abi.multiCall({
        abi: abi.collateralToken,
        chain, block, calls: fixedRateCalls,
      })
      const { output: fixedRateTotalCollateralAmounts } = await sdk.api.abi.multiCall({
        abi: abi.totalPegCollateral,
        chain, block, calls: fixedRateCalls,
      })
      fixedRateCollateralTokens.forEach((data, i) => {
        sdk.util.sumSingleBalance(balances, chain + ':' + data.output, fixedRateTotalCollateralAmounts[i].output)
      })
  }

    // Get synthereumPools by calling SynthereumPoolRegistry_getElements
    const params_list = collaterals.map(collateral => syntheticTokens.map(synth => [synth, collateral, version])).flat()
    const { output: elements_obj } = await sdk.api.abi.multiCall({
      abi: abi["SynthereumPoolRegistry_getElements"],
      calls: params_list.map(params => ({
        target: synthpoolRegistry,
        params: params
      })),
      block,
      chain
    })
    const liquidityPools = elements_obj.map(e => e.output).flat(2)
    
    if (version === 6) {
      const blacklistedPools = [
        '0x63B5891895A57C31d5Ec2a8A5521b6EE67700f9F',
      ].map(i => i.toLowerCase())
      const calls = liquidityPools.filter(i => !blacklistedPools.includes(i.toLowerCase())).map(a => ({ target: a }))
      const { output: collateralTokens } = await sdk.api.abi.multiCall({
        abi: abi.collateralToken,
        chain, block, calls: calls,
      })
      const { output: totalCollateralAmounts } = await sdk.api.abi.multiCall({
        abi: abi.totalCollateralAmount,
        chain, block, calls: calls,
      })
      collateralTokens.forEach((data, i) => {
        sdk.util.sumSingleBalance(balances, chain + ':' + data.output, totalCollateralAmounts[i].output.totalCollateral)
      })
    } else if (version === 5) {
      // Get balances of every LiquidityPool and SynthToken Contracts
    const tokenBalances_calls = collaterals.map(collat =>
      liquidityPools.map(contract => ({
        target: collat,
        params: [contract]
      }))
    ).flat()
    const collateralTokens = await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: tokenBalances_calls,
      block,
      chain
    })
    sdk.util.sumMultiBalanceOf(balances, collateralTokens, true, t => `${chain}:${t}`)
    }
    return balances
  }
}


module.exports = {
  polygon: {
    tvl: chainTvl('polygon')
  },
  xdai: {
    tvl: chainTvl('xdai')
  },
  bsc: {
    tvl: chainTvl('bsc')
  },
  optimism: {
    tvl: chainTvl('optimism')
  },
  avax: {
    tvl: chainTvl('avax')
  },
  methodology: 'Sum all collateral deposited by liquidity providers and users on SynthereumPools (V5 and V6) and FixedRateWrappers'
}