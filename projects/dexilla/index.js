const sdk = require('@defillama/sdk')
const { transformBalances } = require('../helper/portedTokens')
const { era } = require('../helper/coreAssets.json')

const WETH = era.WETH
const USDC = era.USDC
const BUSD = '0x2039bb4116B4EFc145Ec4f0e2eA75012D6C0f181'

const exchanges = [
  {
    addr: '0xCA2eE260BFA64D8Fb01B1cd75615aAa42D528214',
    token1: WETH,
    token2: USDC,
  },
  {
    addr: '0x588450db6e3586Ec0468a7Bb36f1d5f3BbbE2084',
    token1: WETH,
    token2: BUSD,
  },
  {
    addr: '0x0DE31204e919D71f0E7b9E5766950e99f1017826',
    token1: USDC,
    token2: BUSD,
  },
]

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  const balances = {}
  const data = []

  for (let i = 0; i < exchanges.length; i++) {
    const reserves = await api.multiCall({
      calls: [
        {
          target: exchanges[i].token1,
          params: [exchanges[i].addr],
        },
        {
          target: exchanges[i].token2,
          params: [exchanges[i].addr],
        },
      ],
      abi: 'erc20:balanceOf',
    })

    data.push({
      token0Bal: reserves[0],
      token1Bal: reserves[1],
      token0: exchanges[i].token1,
      token1: exchanges[i].token2,
    })
  }

  data.forEach((d) => {
    sdk.util.sumSingleBalance(balances, d.token0, d.token0Bal)
    sdk.util.sumSingleBalance(balances, d.token1, d.token1Bal)
  })

  return transformBalances('era', balances)
}

module.exports = {
  misrepresentedTokens: false,
  methodology: 'TVL counts the ERC20 tokens on the exchange contracts.',
  start: 1685610580, // June 1, 2023 @ 9:09:40 (UTC +0)
  era: { tvl },
}
