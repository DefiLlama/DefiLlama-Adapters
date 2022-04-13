const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const { sumTokens } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const stkTRU = '0x23696914Ca9737466D8553a2d619948f548Ee424'
const TRU = '0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784'
const BUSD = '0x4Fabb145d64652a948d72533023f6E7A623C7C53'
const TUSD = '0x0000000000085d4780B73119b644AE5ecd22b376'
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7"
const managedPortfolioFactory = '0x17b7b75FD4288197cFd99D20e13B0dD9da1FF3E7'

const stablecoins = [BUSD, TUSD, USDC, USDT,]

async function tvl(ts, block) {
  const pools = [
    '0x97cE06c3e3D027715b2d6C22e67D5096000072E5', // TUSD
    '0x6002b1dcB26E7B1AA797A17551C6F487923299d7', // USDT
    '0xA991356d261fbaF194463aF6DF8f0464F8f1c742', // USDC
    '0x1Ed460D149D48FA7d91703bf4890F97220C09437', // BUSD
  ]

  const tokens = (await sdk.api.abi.multiCall({
    calls: pools.map(target => ({ target })),
    abi: abi.token,
    block: block
  })).output

  const portfolios = (await sdk.api.abi.call({
    target: managedPortfolioFactory,
    abi: abi.getPortfolios,
    block
  })).output;

  const balances = {}
  const tokensAndOwners = pools.map((owner, i) => [tokens[i].output, owner])
  stablecoins.map(token => portfolios.map(owner => tokensAndOwners.push([token, owner])))
  await sumTokens(balances, tokensAndOwners, block)
  return balances
}

module.exports = {
  start: 1605830400,            // 11/20/2020 @ 12:00am (UTC)
  ethereum: {
    tvl,
    staking: staking(stkTRU, TRU, 'ethereum')
  }
}