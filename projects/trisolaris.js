const { getUniTVL } = require('./helper/unknownTokens')
const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('./helper/unwrapLPs')
const chain = 'aurora'

const dexTVL = getUniTVL({
  factory: '0xc66F594268041dB60507F00703b152492fb176E7',
  chain: 'aurora',
  coreAssets: [
    "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB",
    //USDC
    "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802",
    //USDT
    "0x4988a896b1227218e4A686fdE5EabdcAbd91571f",
    //wNEAR
    "0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d"
  ]
})

async function stableswapTVL(_, _b, { [chain]: block }) {
  const pools = [
    {
      name: 'USDC/USDT/USN',
      contract: '0x458459E48dbAC0C8Ca83F8D0b7b29FEfE60c3970',
      tokens: [
        '0x5183e1b1091804bc2602586919e6880ac1cf2896',
        '0x4988a896b1227218e4a686fde5eabdcabd91571f',
        '0xb12bfca5a55806aaf64e99521918a4bf0fc40802',
      ],
    },
    {
      name: 'USDC/USDT',
      contract: '0x13e7a001EC72AB30D66E2f386f677e25dCFF5F59',
      tokens: [
        '0x4988a896b1227218e4a686fde5eabdcabd91571f',
        '0xb12bfca5a55806aaf64e99521918a4bf0fc40802',
      ],
    },
    {
      name: 'nUSD-USDC/USDT',
      contract: '0x3CE7AAD78B9eb47Fd2b487c463A17AAeD038B7EC',
      tokens: [
        '0x07379565cd8b0cae7c60dc78e7f601b34af2a21c',
      ],
    },
  ]

  const tokensAndOwners = pools.map(({ contract, tokens }) => tokens.map(t => [t, contract])).flat()
  return sumTokens2({ chain, block, tokensAndOwners })
}

module.exports = {
  misrepresentedTokens: true,
  aurora: {
    tvl: sdk.util.sumChainTvls([stableswapTVL, dexTVL])
  },
};
// node test.js projects/trisolaris.js