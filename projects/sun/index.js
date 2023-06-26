const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const pools = [
  {
    pool: 'TKcEU8ekq2ZoFzLSGFYCUY6aocJBX9X31b', stablecoins: [
      ADDRESSES.tron.USDT, // USDT
      ADDRESSES.tron.USDJ,
      ADDRESSES.tron.TUSD,
    ]
  },
  {
    pool: 'TKVsYedAY23WFchBniU7kcx1ybJnmRSbGt', stablecoins: [  // USDD 3pool
      ADDRESSES.tron.USDT, // USDT
      ADDRESSES.tron.USDD, // USDD
      ADDRESSES.tron.TUSD,
    ]
  },
  {
    pool: 'TAUGwRhmCP518Bm4VBqv7hDun9fg8kYjC4', stablecoins: [  // USDD 2pool
      ADDRESSES.tron.USDD, // USDD
      ADDRESSES.tron.USDT, // USDT
    ]
  },
  {
    pool: 'TQx6CdLHqjwVmJ45ecRzodKfVumAsdoRXH', stablecoins: [
      ADDRESSES.tron.USDC, // // USDC
    ]
  },
  {
    pool: 'TB6zgiG14iQkNxqU4mYe7cMiS5aCYfyidL', stablecoins: [
      ADDRESSES.tron.USDC, // // USDC
    ]
  },
  {
    pool: 'TNTfaTpkdd4AQDeqr8SGG7tgdkdjdhbP5c', stablecoins: [  // USDD 2pool
      ADDRESSES.tron.USDD, // USDD
      ADDRESSES.tron.USDT, // USDT
    ]
  },
  {
    pool: 'TExeaZuD5YPi747PN5yEwk3Ro9eT2jJfB6', stablecoins: [  // USDC 2pool
      ADDRESSES.tron.USDC, // // USDC
      ADDRESSES.tron.USDT, // USDT
    ]
  },
  {
    pool: 'TS8d3ZrSxiGZkqhJqMzFKHEC1pjaowFMBJ', stablecoins: [  // new TUSD 2pool
      ADDRESSES.tron.TUSD,
      ADDRESSES.tron.USDT, // USDT
    ]
  },
  {
    pool: 'TE7SB1v9vRbYRe5aJMWQWp9yfE2k9hnn3s', stablecoins: [  // new USDD/2USD
      ADDRESSES.tron.USDC, // // USDC
    ]
  },
  {
    pool: 'TKBqNLyGJRQbpuMhaT49qG7adcxxmFaVxd', stablecoins: [  // new USDJ/2USD
      ADDRESSES.tron.USDJ,
    ]
  },
  {
    pool: 'TLssvTsY4YZeDPwemQvUzLdoqhFCbVxDGo', stablecoins: [  // new USDC/2USD
      ADDRESSES.tron.USDD, // USDD
    ]
  }
]

const ownerTokens = pools.map(({ pool, stablecoins }) => {
  return [stablecoins, pool]
})

const stakingContract = "TXbA1feyCqWAfAQgXvN1ChTg82HpBT8QPb"
const sun = ADDRESSES.tron.SUN

const lpToken = 'TDQaYrhQynYV9aXTYj63nwLAafRffWSEj6'
const oldLpStaking = "TGsymdggp98tLKZWGHcGX58TjTcaQr9s4x"
const lpStaking = "TAkrcKsS5FW9f3ZfzvWy6Zvsz9uEjUxPoV"

/* async function pool2() {
  const { api } = arguments[3]
  const [lpTokenAmount, sunInLp, trxInLp, totalSupply] = await Promise.all([
    getTokenBalance(lpToken, lpStaking),
    getTokenBalance(sun, lpToken),
    getTrxBalance(lpToken),
    call({ target: lpToken, abi: 'totalSupply()', resTypes: ['number'] }),
  ])
  api.add(sun, sunInLp * lpTokenAmount / totalSupply)
  api.add(nullAddress, trxInLp * lpTokenAmount / totalSupply)
}
 */

module.exports = {
  tron: {
    tvl: sumTokensExport({ ownerTokens }),
    staking: sumTokensExport({ owner: stakingContract, tokens: [sun] }),
    // pool2
  },
}
