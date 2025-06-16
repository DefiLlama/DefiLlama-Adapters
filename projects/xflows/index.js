const sdk = require('@defillama/sdk')
const { getLogs } = require('../helper/cache/getLogs')

// xflows factory contract address
const FACTORY = '0xEB3e557f6FdcaBa8dC98BDA833E017866Fc168cb';
// xflows deployment block on WAN chain
const START_BLOCK = 33432686;

function chainTvl() {
  return async (api) => {
    const logs = (
      await getLogs({
        api,
        target: FACTORY,
        fromBlock: START_BLOCK,
        topic: 'PoolCreated(address,address,uint24,int24,address)',
      })
    )
    const block = api.block

    const pairAddresses = []
    const token0Addresses = []
    const token1Addresses = []

    for (let log of logs) {
      token0Addresses.push(`0x${log.topics[1].substr(-40)}`.toLowerCase())
      token1Addresses.push(`0x${log.topics[2].substr(-40)}`.toLowerCase())
      pairAddresses.push(`0x${log.data.substr(-40)}`.toLowerCase())
    }

    const pairs = {}
    // add token0Addresses
    token0Addresses.forEach((token0Address, i) => {
      const pairAddress = pairAddresses[i]
      pairs[pairAddress] = {
        token0Address: token0Address,
      }
    })

    // add token1Addresses
    token1Addresses.forEach((token1Address, i) => {
      const pairAddress = pairAddresses[i]
      pairs[pairAddress] = {
        ...(pairs[pairAddress] || {}),
        token1Address: token1Address,
      }
    })

    let balanceCalls = []

    // add exclude pairs
    const exclude = [
      '0xc75180d1b5498d8b998dfc2d30e819ca39c6e7d9', 
      '0xd907b5d927e70aa431fd6a79f91133596414c8a2',
    ];

    for (let pair of Object.keys(pairs)) {
      if (exclude.includes(pair)) {
        continue;
      }
      balanceCalls.push({
        target: pairs[pair].token0Address,
        params: pair,
      })
      balanceCalls.push({
        target: pairs[pair].token1Address,
        params: pair,
      })
    }

    const tokenBalances = (
      await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: balanceCalls,
        block,
        chain: 'wan',
      })
    )

    // for WAN chain tokens, use wan: prefix
    const transform = i => `wan:${i}`

    let balances = {};

    sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transform)

    return balances;
  }
}

module.exports = {
  misrepresentedTokens: true,
  wan: {
    tvl: chainTvl(),
  },
}
