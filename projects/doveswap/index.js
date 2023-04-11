const { uniTvlExport, getUniTVL } = require('../helper/unknownTokens')

const { uniV3Export } = require('../helper/uniswapV3')
const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')

const chain = 'polygon_zkevm'

const v2_TVL = getUniTVL({
  factory: '0xeA2709fCD78141976803C3aecA23eCEa3Cb9cb41',
  chain: 'polygon_zkevm',
  useDefaultCoreAssets: true,
})

async function doveswapTVL(_, _b, { [chain]: block }) {
  const pools = [
    {
      name: 'WETH/USDC',
      contract: '0xFA08b8866cBb9b25375d0f9c6562066ec361C8DE',
      tokens: [
        '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
        '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035',
      ],
    },
    {
      name: 'MATIC/USDC',
      contract: '0xf336E951D4a1AbdA48dd82f297917Bce037558Ca',
      tokens: [
        '0xa2036f0538221a77A3937F1379699f44945018d0',
        '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035',
      ],
    },
    {
      name: 'WETH/MATIC',
      contract: '0xe10C9E0E3ED8f7e6D5856957cD7531cE233B941e',
      tokens: [
        '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
        '0xa2036f0538221a77A3937F1379699f44945018d0',
      ],
    },
  ]

  const tokensAndOwners = pools.map(({ contract, tokens }) => tokens.map(t => [t, contract])).flat()
  return sumTokens2({ chain, block, tokensAndOwners })
}

module.exports = {
  misrepresentedTokens: true,
  polygon_zkevm: {
    tvl: sdk.util.sumChainTvls([doveswapTVL, v2_TVL])
  },
};
