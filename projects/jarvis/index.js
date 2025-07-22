const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')

// The synthpoolRegistry addresses can be found in this repo
// https://gitlab.com/jarvis-network/apps/exchange/mono-repo/-/tree/dev/libs/contracts/networks
const contracts = {
  polygon: { // 137
    version: 6, synthpoolRegistry: '0xA5BB18ca30fB27045ec0aA4d7039Fc37a7A03BD1',
    fixedRateVersion: 1, fixedRateRegistry: '0xBdE9c05FeA7a7fB1173024eac529a9c46bD0307f',
    creditLineVersion: 2, selfMintingRegistry: '0x1eA5022a81bd0dF1Bb85085083cDDd1e6A4cf61C'
  },
  bsc: { // 56
    version: 5, synthpoolRegistry: '0x930A54D8Af945F6D1BED5AAF63b63fAb50a8197f',
    fixedRateVersion: 1, fixedRateRegistry: '0x80eB7668AEC208af0dA10F8BB70ca99F3604E076',
    creditLineVersion: 2, selfMintingRegistry: '0xBD8FdDa057de7e0162b7A386BeC253844B5E07A5'
  },
  xdai: { // 100
    version: 5, synthpoolRegistry: '0x43a98e5C4A7F3B7f11080fc9D58b0B8A80cA954e',
  },
  optimism: { // 10
    version: 6, synthpoolRegistry: '0x811F78b7d6bCF1C0E94493C2eC727B50eE32B974',
    creditLineVersion: 2, selfMintingRegistry: '0xBD8FdDa057de7e0162b7A386BeC253844B5E07A5'
  },
  avax: { // 43114
    version: 5, synthpoolRegistry: '0x8FEceC5629EED60D18Fd3438aae4a8E69723D190',
  },
  arbitrum: { // 42161
    version: 6, synthpoolRegistry: '0xf844826e986a2ad77Bf24a491Fe1D8b9ef2d3B03',
    creditLineVersion: 2, selfMintingRegistry: '0x58741E9137a8aF31955D42AEc99a1aD4771EeC23'
  }
}

async function tvl(api) {
  const chain = api.chain
  const { synthpoolRegistry, version } = contracts[chain]
  const { fixedRateRegistry, fixedRateVersion } = contracts[chain]
  const { selfMintingRegistry, creditLineVersion } = contracts[chain]

  // Get liquidityPools by calling getElements(synth, collateral, version)
  // For v5, the collateral is stored in the liquidity pools directly
  // Get collaterals, usually single collat, USDC on polygon, BUSD on BSC, but might be multiple collats later on

  const collaterals = await api.call({ abi: abi["SynthereumPoolRegistry_getCollaterals"], target: synthpoolRegistry, })
  // Get synth token symbols - jEUR, jCHF etc
  const syntheticTokens = await api.call({ abi: abi["SynthereumPoolRegistry_getSyntheticTokens"], target: synthpoolRegistry, })
  if (chain === 'polygon' || chain === 'bsc') {
    // Get collateral for SynthereumFixedRate Wrappers
    const fixedRateCollaterals = await api.call({ abi: abi["SynthereumFixedRateRegistry_getCollaterals"], target: fixedRateRegistry, })

    // Get synthTokens for SynthereumFixedRate Wrappers - jEUR, jCHF etc.
    const fixedRateSynthTokens = await api.call({ abi: abi["SynthereumFixedRateRegistry_getSyntheticTokens"], target: fixedRateRegistry, })

    // Get fixedRateWrappers by calling SynthereumFixedRateRegistry_getElements
    const params_list_fixedRate = fixedRateCollaterals.map(fixedRateCollateral => fixedRateSynthTokens.map(fixedRateSynth => [fixedRateSynth, fixedRateCollateral, fixedRateVersion])).flat().map(i => ({ params: i }))
    const elements_obj_fixedRate = await api.multiCall({ abi: abi["SynthereumFixedRateRegistry_getElements"], target: fixedRateRegistry, calls: params_list_fixedRate })
    const fixedRateWrappers = elements_obj_fixedRate.flat(2)
    const fixedRateCalls = fixedRateWrappers
    const fixedRateCollateralTokens = await api.multiCall({ abi: abi.collateralToken, calls: fixedRateCalls, })
    const fixedRateTotalCollateralAmounts = await api.multiCall({ abi: abi.totalPegCollateral, calls: fixedRateCalls, })
    api.add(fixedRateCollateralTokens, fixedRateTotalCollateralAmounts)
  }

  // Get synthereumPools by calling SynthereumPoolRegistry_getElements
  const params_list = collaterals.map(collateral => syntheticTokens.map(synth => ({ params: [synth, collateral, version]}))).flat()
  const elements_obj = await api.multiCall({ abi: abi["SynthereumPoolRegistry_getElements"], target: synthpoolRegistry, calls: params_list })
  const liquidityPools = elements_obj.flat(2)

  if (version === 6) {
    const blacklistedPools = [
      '0x63B5891895A57C31d5Ec2a8A5521b6EE67700f9F',
      '0x1493607042C5725cEf277A83CFC94caA4fc6278F',
      '0xBC988A0146178825C26c255989cfd5083Bae672C',
      '0x8FEceC5629EED60D18Fd3438aae4a8E69723D190',
    ].map(i => i.toLowerCase())
    const calls = liquidityPools.filter(i => !blacklistedPools.includes(i.toLowerCase()))
    const collateralTokens = await api.multiCall({ abi: abi.collateralToken, calls })
    const totalCollateralAmounts = await api.multiCall({ abi: abi.totalCollateralAmount, calls, permitFailure: true })
    collateralTokens.forEach((data, i) => {
      const totalCollateralAmount = totalCollateralAmounts[i]
      if (!totalCollateralAmount) return
      api.add(data, totalCollateralAmount.totalCollateral)
    })
  } else if (version === 5) {
    // Get balances of every LiquidityPool and SynthToken Contracts
    await sumTokens2({ api, owners: liquidityPools, tokens: collaterals })
  }

  if (chain === 'polygon' || chain === 'bsc' || chain === 'optimism' || chain === 'arbitrum') {
    // Get collateral token addresses from self minting registry
    const selfMintingCollaterals = await api.call({ abi: abi["SynthereumSelfMintingRegistry_getCollaterals"], target: selfMintingRegistry, })
    // Get synth token symbols - jEUR, jCHF etc
    const selfMintingSyntheticTokens = await api.call({ abi: abi["SynthereumSelfMintingRegistry_getSyntheticTokens"], target: selfMintingRegistry, })
    // Get creditLineDerivatives by calling SynthereumSelfMintingRegistry_getElements
    const params_list_creditline = selfMintingCollaterals.map(selfMintingCollateral => selfMintingSyntheticTokens.map(selfMintingSynth => ({ params: [selfMintingSynth, selfMintingCollateral, creditLineVersion]}))).flat()
    const elements_obj_creditline = await api.multiCall({
      abi: abi["SynthereumSelfMintingRegistry_getElements"], target: selfMintingRegistry, calls: params_list_creditline,
    })

    const creditLineDerivatives = elements_obj_creditline.flat(2)

    const creditLineCalls = creditLineDerivatives
    const creditLineCollateralTokens = await api.multiCall({ abi: abi.collateralToken, calls: creditLineCalls, })
    const creditLineTotalCollateralAmounts = await api.multiCall({ abi: abi.getGlobalPositionData, calls: creditLineCalls, })
    creditLineCollateralTokens.forEach((data, i) => {
      api.add(data, creditLineTotalCollateralAmounts[i].totCollateral)
    })
  }
}

module.exports = {
  methodology: 'Sum all collateral deposited by liquidity providers and users on SynthereumPools (V5 and V6) and FixedRateWrappers'
};


Object.keys(contracts).forEach(chain => {
  module.exports[chain] = { tvl }
})
