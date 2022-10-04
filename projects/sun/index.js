const sdk = require('@defillama/sdk')
const { getTokenBalance, getTrxBalance, unverifiedCall } = require('../helper/tron');

const pools = [
  {
    pool: 'TKcEU8ekq2ZoFzLSGFYCUY6aocJBX9X31b', stablecoins: [
      ["TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", "tether"], // USDT
      ["TMwFHYXLJaRUPeW6421aqXL4ZEzPRFGkGT", "just-stablecoin"], // USDJ
      ["TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4", "true-usd"] // TUSD 
    ]
  },
  {
    pool: 'TKVsYedAY23WFchBniU7kcx1ybJnmRSbGt', stablecoins: [  // USDD 3pool
    ["TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", "tether"], // USDT
    ["TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn", "usdd"], // USDD
    ["TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4", "true-usd"] // TUSD 
    ]
  },
  {
    pool: 'TAUGwRhmCP518Bm4VBqv7hDun9fg8kYjC4', stablecoins: [  // USDD 2pool
    ["TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn", "usdd"], // USDD
    ["TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", "tether"], // USDT
    ]
  },
  {
    pool: 'TQx6CdLHqjwVmJ45ecRzodKfVumAsdoRXH', stablecoins: [
      ["TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8", "usd-coin"], // USDC
    ]
  },
  {
    pool: 'TB6zgiG14iQkNxqU4mYe7cMiS5aCYfyidL', stablecoins: [
      ["TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8", "usd-coin"], // USDC
    ]
  },
  {
    pool: 'TNTfaTpkdd4AQDeqr8SGG7tgdkdjdhbP5c', stablecoins: [  // new USDD 2pool
      ["TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn", "usdd"], // USDD
      ["TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", "tether"], // USDT
    ]
  }
]

  async function tvl() {
    const balances = {}
    for( let poolConfig of pools) {
      const {
        pool, 
        stablecoins
      } = poolConfig
      for ( let [token, label] of stablecoins) {
        const tokenBalace= await getTokenBalance(token, pool)
        sdk.util.sumSingleBalance(balances, label, tokenBalace)
      }
    }

    return balances
  }

const stakingContract = "TXbA1feyCqWAfAQgXvN1ChTg82HpBT8QPb"
const sun = "TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S"
async function staking() {
  return {
    "sun-token": await getTokenBalance(sun, stakingContract)
  }
}

const lpToken = 'TDQaYrhQynYV9aXTYj63nwLAafRffWSEj6'
const oldLpStaking = "TGsymdggp98tLKZWGHcGX58TjTcaQr9s4x"
const lpStaking = "TAkrcKsS5FW9f3ZfzvWy6Zvsz9uEjUxPoV"

async function pool2() {
  const [lpTokenAmount, sunInLp, trxInLp, totalSupply] = await Promise.all([
    getTokenBalance(lpToken, lpStaking),
    getTokenBalance(sun, lpToken),
    getTrxBalance(lpToken),
    unverifiedCall(lpToken, 'totalSupply()', [])
  ])
  return {
    "sun-token": sunInLp * lpTokenAmount / (totalSupply / 10 ** 6),
    "tron": trxInLp * lpTokenAmount / totalSupply,
  }
}


module.exports = {
  tron: {
    tvl,
    staking,
    pool2
  },
}
