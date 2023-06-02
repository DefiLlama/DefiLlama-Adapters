const sdk = require('@defillama/sdk')
const { transformBalances } = require('../helper/portedTokens')
const { era, optimism } = require('../helper/coreAssets.json')

const tokens = {
  324: {
    WETH: era.WETH,
    USDC: era.USDC,
    BUSD: '0x2039bb4116B4EFc145Ec4f0e2eA75012D6C0f181',
  },
  10: {
    OP: optimism.OP,
    USDC: optimism.USDC,
    VELO: '0x3c8B650257cFb5f272f799F5e2b4e65093a11a05',
    SNX: '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4',
  },
}

const exchanges = {
  324: [
    {
      addr: '0xCA2eE260BFA64D8Fb01B1cd75615aAa42D528214',
      token1: tokens[324].WETH,
      token2: tokens[324].USDC,
    },
    {
      addr: '0x588450db6e3586Ec0468a7Bb36f1d5f3BbbE2084',
      token1: tokens[324].WETH,
      token2: tokens[324].BUSD,
    },
    {
      addr: '0x0DE31204e919D71f0E7b9E5766950e99f1017826',
      token1: tokens[324].USDC,
      token2: tokens[324].BUSD,
    },
  ],
  10: [
    {
      addr: '0x189c3f9dcAfe968Be3620cC58274E7c5DF057C7c',
      token1: tokens[10].OP,
      token2: tokens[10].USDC,
    },
    {
      addr: '0x68D05405472C4f0c254A47922Dba9dbC4CFf2bD9',
      token1: tokens[10].VELO,
      token2: tokens[10].USDC,
    },
    {
      addr: '0x8F1F6751236855391BbBEDBf4Bf5AD7e383E6e50',
      token1: tokens[10].SNX,
      token2: tokens[10].USDC,
    },
  ],
}

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  const balances = {}
  const data = []

  for (let i = 0; i < exchanges[api.chainId].length; i++) {
    const reserves = await api.multiCall({
      calls: [
        {
          target: exchanges[api.chainId][i].token1,
          params: [exchanges[api.chainId][i].addr],
        },
        {
          target: exchanges[api.chainId][i].token2,
          params: [exchanges[api.chainId][i].addr],
        },
      ],
      abi: 'erc20:balanceOf',
    })

    data.push({
      token0Bal: reserves[0],
      token1Bal: reserves[1],
      token0: exchanges[api.chainId][i].token1,
      token1: exchanges[api.chainId][i].token2,
    })
  }

  data.forEach((d) => {
    sdk.util.sumSingleBalance(balances, d.token0, d.token0Bal)
    sdk.util.sumSingleBalance(balances, d.token1, d.token1Bal)
  })

  return transformBalances(api.chain, balances)
}

module.exports = {
  misrepresentedTokens: false,
  methodology: 'TVL counts the ERC20 tokens on the exchange contracts.',
  start: 1685610580, // June 1, 2023 @ 9:09:40 (UTC +0)
  era: { tvl },
  optimism: { tvl },
}
