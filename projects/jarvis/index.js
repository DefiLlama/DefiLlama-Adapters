const sdk = require("@defillama/sdk");

const contracts = {
  ethereum:{
    usdcToken : '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    synthCollateralContracts : ['0x48546bdd57d34cb110f011cdd1ccaae75ee17a70', '0x182d5993106573a95a182ab3a77c892713ffda56', '0x496b179d5821d1a8b6c875677e3b89a9229aab77', "0x911f0Dfc9d98Fcf6E4d07410E7aC460F19843599", "0xF47Ff36956105255E64455BfEDe4538768439066", "0x2431b64cDD6D7E9A630046d225BA4F01B3AC9D3b", "0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c", "0x767058F11800FBA6A682E73A6e79ec5eB74Fac8c", "0xbD1463F02f61676d53fd183C2B19282BFF93D099", "0xCbbA8c0645ffb8aA6ec868f6F5858F2b0eAe34DA", "0xeF4Db4AF6189aae295a680345e07E00d25ECBAAb", "0x10d00f5788c39a2bf248adfa2863fa55d83dce36"],
    liquidityPools : ['0x833407f9c6C55df59E7fe2Ed6fB86bb413536359', '0x2D8b421F3C6F14Df2887dce70b517d87d11af1E0', '0x6FF556740b30dFb092602dd5721F6D42c66A1580'] // Not AMM LP pools, just pools where money is waiting to be used for minting
  },
  polygon:{
    usdcToken : '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    synthCollateralContracts: ['0x0fa1a6b68be5dd9132a09286a166d75480be9165', '0xa87b3e78d128dab9db656cf459c9266c4c1d5255', '0x9b0a1c61f234e2d21b6f7c0da6178dfbbaa3756f'],
    liquidityPools: ['0xcbba8c0645ffb8aa6ec868f6f5858f2b0eae34da', '0x10d00f5788c39a2bf248adfa2863fa55d83dce36', '0xef4db4af6189aae295a680345e07e00d25ecbaab']
  }
}

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let balances = {};
    const block = chainBlocks[chain]
    const {synthCollateralContracts, liquidityPools, usdcToken} = contracts[chain]

    const collateralTokens = await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: synthCollateralContracts.concat(liquidityPools).map(contract => ({
        target: usdcToken,
        params: [contract]
      })),
      block,
      chain
    })
    sdk.util.sumMultiBalanceOf(balances, collateralTokens, true, t=>`${chain}:${t}`)
    return balances
  }
}


module.exports = {
  ethereum: {
    tvl: chainTvl('ethereum')
  },
  polygon: {
    tvl: chainTvl('polygon')
  },
  tvl: sdk.util.sumChainTvls([chainTvl('ethereum'), chainTvl('polygon')])
}