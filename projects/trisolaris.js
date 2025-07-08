const ADDRESSES = require('./helper/coreAssets.json')
const { getUniTVL } = require('./helper/unknownTokens')
const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('./helper/unwrapLPs')

const dexTVL = getUniTVL({
  factory: '0xc66F594268041dB60507F00703b152492fb176E7',
  useDefaultCoreAssets: true,
})

async function stableswapTVL(api) {
  const pools = [
    {
      name: 'USDC/USDT/USN',
      contract: '0x458459E48dbAC0C8Ca83F8D0b7b29FEfE60c3970',
      tokens: [
        '0x5183e1b1091804bc2602586919e6880ac1cf2896',
        ADDRESSES.aurora.USDT_e,
        ADDRESSES.aurora.USDC_e,
      ],
    },
    {
      name: 'USDC/USDT',
      contract: '0x13e7a001EC72AB30D66E2f386f677e25dCFF5F59',
      tokens: [
        ADDRESSES.aurora.USDT_e,
        ADDRESSES.aurora.USDC_e,
      ],
    },
    {
      name: 'nUSD-USDC/USDT',
      contract: '0x3CE7AAD78B9eb47Fd2b487c463A17AAeD038B7EC',
      tokens: [
        ADDRESSES.aurora.nUSD,
      ],
    },
  ]

  const tokensAndOwners = pools.map(({ contract, tokens }) => tokens.map(t => [t, contract])).flat()
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  misrepresentedTokens: true,
  aurora: {
    tvl: sdk.util.sumChainTvls([stableswapTVL, dexTVL])
  },
};
// node test.js projects/trisolaris.js