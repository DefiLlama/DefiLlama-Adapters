const sdk = require("@defillama/sdk")
const utils = require('./helper/utils')
const abi = require("./config/hakka/abi.json")
const { default: BigNumber } = require("bignumber.js")
const WeiPerEther = 1e18

const HAKKA_ADDRESSES = {
  1: '0x0E29e5AbbB5FD88e28b2d355774e73BD47dE3bcd',
  56: '0x1d1eb8e8293222e1a29d2c0e4ce6c0acfd89aaac',
}
const thirdFloorAddress = '0x66be1bc6C6aF47900BBD4F3711801bE6C2c6CB32'

async function thirdFloor(price_feed) {
  const ethBalance = await utils.returnEthBalance(thirdFloorAddress)
  const ethPrice = price_feed.data.ethereum.usd
  const ethValue = BigNumber(ethBalance).times(ethPrice)
  
  return ethValue
}

async function getRewardPool2(price_feed) {
  const BHS_USDC_DAI_HAKKA_BPT = '0x1B8874BaceAAfba9eA194a625d12E8b270D77016'
  const BHS_USDC_DAI_HAKKA_POOL = '0x6EE6683Cb9b44810369C873679f8073bCBE52F27'
  const tokens = [
    {
      name: 'hakka-finance',
      address: '0x0E29e5AbbB5FD88e28b2d355774e73BD47dE3bcd',
    },
    {
      name: 'dai',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    },
    {
      name: 'usd-coin',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    },
    {
      name: 'blackholeswap-compound-dai-usdc',
      address: '0x35101c731b1548B5e48bb23F99eDBc2f5c341935'
    }
  ]

  const { output: tokenTvl } = await sdk.api.abi.multiCall({
    calls: tokens.map((token) => ({
      target: token.address,
      params: [BHS_USDC_DAI_HAKKA_BPT],
    })),
    abi: abi['balanceOf'],
  })
  const { output: bptSupply } = await sdk.api.abi.call({
    target: BHS_USDC_DAI_HAKKA_BPT,
    abi: abi['totalSupply'],
  })
  const { output: poolBpt } = await sdk.api.abi.call({
    target: BHS_USDC_DAI_HAKKA_BPT,
    params: [BHS_USDC_DAI_HAKKA_POOL],
    abi: abi['balanceOf'],
  })
  
  const tokenValue = tokenTvl.map((res, index) => BigNumber(res.output).times(price_feed.data[tokens[index].name].usd))
  const pricePerBpt = tokenValue.reduce((a, c) => BigNumber(a).plus(c)).div(BigNumber(bptSupply))

  return pricePerBpt.times(poolBpt).div(WeiPerEther)
}

async function getRewardPool3(price_feed) {
  const BHS_HAKKA_BPT = '0xaE95D3198d602acFB18F9188d733d710e14A27Dd'
  const BHS_HAKKA_POOL = '0x3792ee68E736b8214D4eDC91b1B3340B525e00BF'
  const tokens = [
    {
      name: 'hakka-finance',
      address: '0x0E29e5AbbB5FD88e28b2d355774e73BD47dE3bcd',
    },
    {
      name: 'blackholeswap-compound-dai-usdc',
      address: '0x35101c731b1548B5e48bb23F99eDBc2f5c341935'
    }
  ]

  const { output: tokenTvl } = await sdk.api.abi.multiCall({
    calls: tokens.map((token) => ({
      target: token.address,
      params: [BHS_HAKKA_BPT],
    })),
    abi: abi['balanceOf'],
  })
  const { output: bptSupply } = await sdk.api.abi.call({
    target: BHS_HAKKA_BPT,
    abi: abi['totalSupply'],
  })
  const { output: poolBpt } = await sdk.api.abi.call({
    target: BHS_HAKKA_BPT,
    params: [BHS_HAKKA_POOL],
    abi: abi['balanceOf'],
  })
  
  const tokenValue = tokenTvl.map((res, index) => BigNumber(res.output).times(price_feed.data[tokens[index].name].usd))
  const pricePerBpt = tokenValue.reduce((a, c) => BigNumber(a).plus(c)).div(BigNumber(bptSupply))

  return pricePerBpt.times(poolBpt).div(WeiPerEther)
}

async function rewards(price_feed) {
  const four = await getRewardPool2(price_feed)
  const half = await getRewardPool3(price_feed)
  const tvl = four.plus(half)
  
  return tvl
}

async function stakedHakka(price_feed) {
  const sHakka = '0xd9958826Bce875A75cc1789D5929459E6ff15040'

  const { output: hakkaBalance } = await sdk.api.abi.call({
    target: HAKKA_ADDRESSES[1],
    params: [sHakka],
    abi: abi['balanceOf'],
  })

  const hakkaPrice = price_feed.data['hakka-finance'].usd
  const hakkaBalanceBignum = BigNumber(hakkaBalance)
  const hakkaValue = hakkaBalanceBignum.times(hakkaPrice).div(WeiPerEther)
  
  return hakkaValue
}

async function intelligence(price_feed) {
  const ethAddress = ['0x0F2fd95c221770d108aCD5363D25b06Bdc43140B']
  const bscAddress = ['0xD8B3fF98025Cf203Ba6D7Bb2d25DBeEF9539E6FB', '0x517Ef6281a9b3dc4Ef6B0318Bc5EDFDCf677d29D', '0x0A3e364eE37bac9E6aFF9E864E65B4603D5BC5D4']
  const { output: ethTvl } = await sdk.api.abi.multiCall({
    calls: ethAddress.map((round) => ({
      target: HAKKA_ADDRESSES[1],
      params: [round],
    })),
    abi: abi['balanceOf'],
  })

  const { output: bscTvl } = await sdk.api.abi.multiCall({
    calls: bscAddress.map((round) => ({
      target: HAKKA_ADDRESSES[56],
      params: [round],
    })),
    abi: abi["balanceOf"],
    chain: 'bsc',
  })
  
  const ethTvlBignum = ethTvl.map((res) => BigNumber(res.output))
  const bscTvlBignum = bscTvl.map((res) => BigNumber(res.output))
  
  const hakkaPrice = price_feed.data['hakka-finance'].usd
  const totalHakka = [...ethTvlBignum, ...bscTvlBignum].reduce((accumulator, currentValue) => accumulator.plus(currentValue))
  const hakkaValue = totalHakka.times(hakkaPrice).div(WeiPerEther)
  
  return hakkaValue
}

async function guildBank(price_feed) {
  const hakkaGuildBank = '0x83D0D842e6DB3B020f384a2af11bD14787BEC8E7'
  const tokens = [
    {
      name: 'maker',
      address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    },
    {
      name: 'blackholeswap-compound-dai-usdc',
      address: '0x35101c731b1548B5e48bb23F99eDBc2f5c341935'
    },
    {
      name: 'usd-coin',
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    }
  ]

  const { output: tokenTvl } = await sdk.api.abi.multiCall({
    calls: tokens.map((token) => ({
      target: token.address,
      params: [hakkaGuildBank],
    })),
    abi: abi['balanceOf'],
  })

  const ethBalance = await utils.returnEthBalance(hakkaGuildBank)
  const ethValue = BigNumber(ethBalance).times(price_feed.data.ethereum.usd)
  const tokenValue = tokenTvl.map((res, index) => BigNumber(res.output).times(price_feed.data[tokens[index].name].usd))

  const tvl = ethValue.plus(tokenValue.reduce((a, c) => BigNumber(a).plus(c)).div(WeiPerEther))
  
  return tvl
}

async function bscBlackHoleSwap(price_feed) {
  const BSC_BHS_ADDRESS = '0x75192D6f3d51554CC2eE7B40C3aAc5f97934ce7E'
  const tokens = [
    {
      name: 'binance-usd',
      address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    },
    {
      name: 'tether',
      address: '0x55d398326f99059ff775485246999027b3197955'
    }
  ]

  const { output: tokenTvl } = await sdk.api.abi.multiCall({
    calls: tokens.map((token) => ({
      target: token.address,
      params: [BSC_BHS_ADDRESS],
    })),
    abi: abi['balanceOf'],
    chain: 'bsc',
  })

  const tokenValue = tokenTvl.map((res, index) => BigNumber(res.output).times(price_feed.data[tokens[index].name].usd))
  const tvl = tokenValue.reduce((a, c) => BigNumber(a).plus(c)).div(WeiPerEther)

  return tvl
}

// Harvesters
const PANCAKE_STAKING_ADDRESS = '0x73feaa1eE314F8c655E354234017bE2193C9E24E'
const ALPACA_STAKING_ADDRESS = '0xA625AB01B08ce023B2a342Dbb12a16f2C8489A8F'
const BELT_STAKING_ADDRESS = '0xD4BbC80b9B102b77B21A06cb77E954049605E6c1'
const ALPACA_ADDRESS = '0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F'
const CAKE_ADDRESS = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'
const BUSD_ADDRESS = '0xe9e7cea3dedca5984780bafc599bd69add087d56'
const WBNB_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'

const BSC_HARVEST_POOLS = [
  {
    // Pool 1
    name: 'BUSD-BNB Harvester',
    tokenAddress: '0x1b96b92314c44b159149f7e0303511fb2fc4774f',
    rewardsAddress: '0x6a3093dc9097fe54c02ffaeb64b6e3a52f4642c8',
    getTVL: pancake_BUSD_BNB_TVL,
  },
  {
    // Pool 2
    name: 'CAKE-BNB Harvester',
    tokenAddress: '0xA527a61703D82139F8a06Bc30097cC9CAA2df5A6',
    rewardsAddress: '0x3792ee68E736b8214D4eDC91b1B3340B525e00BF',
    getTVL: pancake_CAKE_BNB_TVL,
  },
  {
    // Pool 3
    name: 'Alpaca LP Harvester',
    tokenAddress: '0xf3ce6aac24980e6b657926dfc79502ae414d3083',
    rewardsAddress: '0xCb2131C9D1381c38282C006EAa56DE26BD99888E',
    getTVL: alpacaLP_TVL,
  },
  {
    // Pool 4
    name: 'Alpaca BNB Harvester',
    tokenAddress: '0xd7d069493685a581d27824fc46eda46b7efc0063',
    rewardsAddress: '0x992c0170e5f0352a8af39d95dc15fb5edced852c',
    getTVL: alpacaBNB_TVL,
  },
  {
    // Pool 5
    name: 'Alpaca BUSD Harvester',
    tokenAddress: '0x7c9e73d4c71dae564d41f78d56439bb4ba87592f',
    rewardsAddress: '0x4D5054708982e96F284D02c7a46F31d6f7291C56',
    getTVL: alpacaBUSD_TVL,
  },
  {
    // Pool 6
    name: 'Belt4 Harvester',
    tokenAddress: '0x86afa7ff694ab8c985b79733745662760e454169',
    rewardsAddress: '0x8ba1c31cb3c51889c5699fb8121e3c01dbc53b96',
    getTVL: belt4_TVL,
  },
]

async function pancake_BUSD_BNB_TVL( // 2
  tokenAddress,
  rewardsAddress,
  price_feed,
) {
  const tokens = [
    {
      name: 'binance-usd',
      address: BUSD_ADDRESS,
    },
    {
      name: 'wbnb',
      address: WBNB_ADDRESS
    }
  ]

  const { output: tokenTvl } = await sdk.api.abi.multiCall({
    calls: tokens.map((token) => ({
      target: token.address,
      params: [tokenAddress],
    })),
    abi: abi['balanceOf'],
    chain: 'bsc',
  })
  const { output: lpTotalSupply } = await sdk.api.abi.call({
    target: tokenAddress,
    abi: abi['totalSupply'],
    chain: 'bsc',
  })
  const { output: rewardsBalance } = await sdk.api.abi.call({
    target: PANCAKE_STAKING_ADDRESS,
    params: [2, rewardsAddress],
    abi: abi['pancakeUserInfo'],
    chain: 'bsc',
  })
  
  const lpValue = tokenTvl.map((res, index) => BigNumber(res.output).times(price_feed.data[tokens[index].name].usd))
  const pricePerLp = lpValue.reduce((a, c) => BigNumber(a).plus(c)).div(BigNumber(lpTotalSupply))
  const tvl = pricePerLp.times(rewardsBalance.amount).div(WeiPerEther)

  return tvl
}

async function pancake_CAKE_BNB_TVL( // 1
  tokenAddress,
  rewardsAddress,
  price_feed,
) {
  const tokens = [
    {
      name: 'pancakeswap-token',
      address: CAKE_ADDRESS,
    },
    {
      name: 'wbnb',
      address: WBNB_ADDRESS
    }
  ]

  const { output: tokenTvl } = await sdk.api.abi.multiCall({
    calls: tokens.map((token) => ({
      target: token.address,
      params: [tokenAddress],
    })),
    abi: abi['balanceOf'],
    chain: 'bsc',
  })
  const { output: lpTotalSupply } = await sdk.api.abi.call({
    target: tokenAddress,
    abi: abi['totalSupply'],
    chain: 'bsc',
  })
  const { output: rewardsBalance } = await sdk.api.abi.call({
    target: PANCAKE_STAKING_ADDRESS,
    params: [1, rewardsAddress],
    abi: abi['pancakeUserInfo'],
    chain: 'bsc',
  })
  
  const lpValue = tokenTvl.map((res, index) => BigNumber(res.output).times(price_feed.data[tokens[index].name].usd))
  const pricePerLp = lpValue.reduce((a, c) => BigNumber(a).plus(c)).div(BigNumber(lpTotalSupply))
  const tvl = pricePerLp.times(rewardsBalance.amount).div(WeiPerEther)

  return tvl
}

async function alpacaLP_TVL( // 4
  tokenAddress,
  rewardsAddress,
  price_feed,
) {
  const tokens = [
    {
      name: 'alpaca-finance',
      address: ALPACA_ADDRESS,
    },
    {
      name: 'wbnb',
      address: WBNB_ADDRESS
    }
  ]

  const { output: tokenTvl } = await sdk.api.abi.multiCall({
    calls: tokens.map((token) => ({
      target: token.address,
      params: [tokenAddress],
    })),
    abi: abi['balanceOf'],
    chain: 'bsc',
  })
  const { output: lpTotalSupply } = await sdk.api.abi.call({
    target: tokenAddress,
    abi: abi['totalSupply'],
    chain: 'bsc',
  })
  const { output: rewardsBalance } = await sdk.api.abi.call({
    target: ALPACA_STAKING_ADDRESS,
    params: [4, rewardsAddress],
    abi: abi['alpacaUserInfo'],
    chain: 'bsc',
  })
  
  const lpValue = tokenTvl.map((res, index) => BigNumber(res.output).times(price_feed.data[tokens[index].name].usd))
  const pricePerLp = lpValue.reduce((a, c) => BigNumber(a).plus(c)).div(BigNumber(lpTotalSupply))
  const tvl = pricePerLp.times(rewardsBalance.amount).div(WeiPerEther)

  return tvl
}

async function alpacaBNB_TVL( // 1
  tokenAddress,
  rewardsAddress,
  price_feed,
) {
  const { output: rewardsBalance } = await sdk.api.abi.call({
    target: ALPACA_STAKING_ADDRESS,
    params: [1, rewardsAddress],
    abi: abi['alpacaUserInfo'],
    chain: 'bsc',
  })
  
  const price = price_feed.data['wbnb'].usd
  const rewardsBalanceBignum = BigNumber(rewardsBalance.amount)
  const tvl = rewardsBalanceBignum.times(price).div(WeiPerEther)

  return tvl
}

async function alpacaBUSD_TVL( // 3
  tokenAddress,
  rewardsAddress,
  price_feed,
) {
  const { output: rewardsBalance } = await sdk.api.abi.call({
    target: ALPACA_STAKING_ADDRESS,
    params: [3, rewardsAddress],
    abi: abi['alpacaUserInfo'],
    chain: 'bsc',
  })
  
  const price = price_feed.data['binance-usd'].usd
  const rewardsBalanceBignum = BigNumber(rewardsBalance.amount)
  const tvl = rewardsBalanceBignum.times(price).div(WeiPerEther)

  return tvl
}

async function belt4_TVL(
  tokenAddress,
  rewardsAddress,
  price_feed,
) {
  const { output: rewardsBalance } = await sdk.api.abi.call({
    target: BELT_STAKING_ADDRESS,
    params: [0, rewardsAddress],
    abi: abi['beltUserInfo'],
    chain: 'bsc',
  })

  const tvl = BigNumber(rewardsBalance.shares).div(WeiPerEther)

  return tvl
}

async function harvesters(price_feed) {
  const harvesterTvl = await Promise.all(
    BSC_HARVEST_POOLS.map((pool) =>
      pool.getTVL(
        pool.tokenAddress,
        pool.rewardsAddress,
        price_feed,
      ),
    ),
  )

  const harvesterTvlSum = harvesterTvl.reduce((accumulator, currentValue) => accumulator.plus(currentValue))
  return harvesterTvlSum
}


async function fetch() {
    const tokens = [
      'ethereum',
      'hakka-finance',
      'binancecoin',
      'binance-usd',
      'pancakeswap-token',
      'wbnb',
      'alpaca-finance',
      'maker',
      'blackholeswap-compound-dai-usdc',
      'dai',
      'usd-coin',
      'tether',
    ]
    const price_feed = await utils.getPricesfromString(tokens.toString());

    // Harvesters
    const harvesterTvl = await harvesters(price_feed)

    // Guild Bank
    const guildBankTvl = await guildBank(price_feed)

    // 3F
    const thirdFloorTvl = await thirdFloor(price_feed)

    // sHakka
    const sHakkaTvl = await stakedHakka(price_feed)

    // BHS on BSC
    const bscBhsTvl = await bscBlackHoleSwap(price_feed)

    // Hakka Intelligence
    const intelligenceTvl = await intelligence(price_feed)

    // Rewards without sHakka
    const rewardsTvl = await rewards(price_feed)

    const allData = {
      harvesterTvl: harvesterTvl,
      guildBankTvl: guildBankTvl,
      thirdFloorTvl: thirdFloorTvl,
      sHakkaTvl: sHakkaTvl,
      bscBhsTvl: bscBhsTvl,
      intelligenceTvl: intelligenceTvl,
      rewardsTvl: rewardsTvl,
    }
    // console.log(allData)
    const tvl = Object.values(allData).reduce((a, c) => a.plus(c)).toFixed(0)
    return tvl
}


module.exports = {
  fetch
}
