const { getUniTVL, staking } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')
const uniswapAbi = require('../helper/abis/uniswap')

const WETH_MG = "0xd75528908c0981b92758aD6cE7d18C0Dd163f8ae";
const xCRX = "0x35AfE95662fdf442762a11E4eD5172C81fBceF7e";
const CRX = "0xb21Be1Caf592A5DC1e75e418704d1B6d50B0d083";
const factory = "0x7C7F1c8E2b38d4C06218565BC4C9D8231b0628c0";

async function tvlETH(_, _b, { arbitrum: block }) {
  const reserves = await sdk.api2.abi.call({ abi: uniswapAbi.getReserves, target: WETH_MG, chain: 'arbitrum', block})
  let balance = reserves[0] / 10 ** 18
  return {['WETH'] : balance};
}

const tvl = getUniTVL({ factory, chain: 'arbitrum', useDefaultCoreAssets: false, fetchBalances: true })

module.exports = {
  doublecounted: false,
  methodology:
    "Factory address (0x7C7F1c8E2b38d4C06218565BC4C9D8231b0628c0) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  arbitrum: {
    tvl : sdk.util.sumChainTvls([tvlETH, tvl]),
    staking: staking(
      {
        owner: xCRX,
        tokens: [CRX],
        chain: 'arbitrum',
        coreAssets: ['0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'],
        lps: ['0xf7305D209BFeCF40Bd53ccBdbe5303B3153d0660']
      })
  },
};
