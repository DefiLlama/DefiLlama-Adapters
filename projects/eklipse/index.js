const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')
const { getChainTransform, getFixBalances, } = require('../helper/portedTokens')
const { toUSDTBalances } = require('../helper/balances')
const { sumTokens } = require('../helper/unwrapLPs')
const vaults = require('./vaults')
const chain = 'klaytn'
const EKL_TOKEN = '0x807c4e063eb0ac21e8eef7623a6ed50a8ede58ca'
const STAKING_ADDRESS = '0xD067C3b871ee9E07BA4205A8F96c182baBBA6c58'
const USDT_TOKEN = '0xceE8FAF64bB97a73bb51E115Aa89C17FfA8dD167'
const POOL2_ADDRESS = '0x625ae9043e8730c4a1e30b36838502fb90e1d3c2'
const USDT_PAIR = '0x219ee5d76593f5bd639125b6411a17d309e3ad31'
const KLAY_PAIR = '0x5db231ac93faaad876155dc0853bb11a2f4b0fb2'
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

const TOKENS = {
  kDAI: {
    address: '0x5c74070fdea071359b86082bd9f9b3deaafbe32b',
    decimal: 18
  },
  kBUSD: {
    address: '0x210bc03f49052169d5588a52c317f71cf2078b85',
    decimal: 18
  },
  kUSDC: {
    decimal: 6,
    address: '0x754288077d0ff82af7a5317c7cb8c444d421d103'
  },
  KSD: {
    address: '0x4fa62f1f404188ce860c8f0041d6ac3765a72e67',
    decimal: 18
  },
  KASH: {
    address: '0xce40569d65106c32550626822b91565643c07823',
    decimal: 18
  },
  EKL: {
    decimal: 18,
    address: '0x807c4e063eb0ac21e8eef7623a6ed50a8ede58ca'
  },
  kUSDT: {
    decimal: 6,
    address: '0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167'
  },
  pUSD: {
    decimal: 18,
    address: '0x168439b5eebe8c83db9eef44a0d76c6f54767ae4'
  }
}

async function tvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks[chain]
  const transformAddress = await getChainTransform(chain)
  const balances = {}
  const tokensAndOwners = []

  vaults.forEach(({ lpAddress: owner, tvlTokenList }) => {
    tvlTokenList.forEach(token => {
      if (!TOKENS[token]) return;
      tokensAndOwners.push([TOKENS[token].address, owner])
    })
  })

  await sumTokens(balances, tokensAndOwners, block, chain, transformAddress)

  return balances
}


async function staking(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks[chain]
  const transformAddress = await getChainTransform(chain)
  const balances = {}

  await sumTokens(balances, [[EKL_TOKEN, STAKING_ADDRESS]], block, chain, transformAddress)

  const data = (await sdk.api.erc20.balanceOf({ target: EKL_TOKEN, owner: STAKING_ADDRESS, block, chain, })).output
  const value = BigNumber(data).multipliedBy(await getElkPrice()).toFixed(0)
  return toUSDTBalances(value, 1e-12)
}


async function pool2(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks[chain]
  const transformAddress = await getChainTransform(chain)
  const fixBalances = await getFixBalances(chain)
  const balances = {}

  // Unwrap USDT-EKL LP position
  const USDT_LP_Tokens = (await sdk.api.erc20.balanceOf({ target: USDT_PAIR, owner: POOL2_ADDRESS, block, chain, })).output
  const USDT_Tokens = (await sdk.api.erc20.balanceOf({ target: USDT_TOKEN, owner: USDT_PAIR, block, chain, })).output
  const USDT_LP_totalSupply = (await sdk.api.erc20.totalSupply({ target: USDT_PAIR, block, chain, })).output
  balances[transformAddress(USDT_TOKEN)] = BigNumber(USDT_Tokens).multipliedBy(2).multipliedBy(USDT_LP_Tokens).dividedBy(USDT_LP_totalSupply).toFixed(0)

  // Unwrap USDT-EKL LP position
  const KLAY_LP_Tokens = (await sdk.api.erc20.balanceOf({ target: KLAY_PAIR, owner: POOL2_ADDRESS, block, chain, })).output
  const KLAY_Tokens = (await sdk.api.eth.getBalance({ target: KLAY_PAIR, block, chain, })).output
  const KLAY_LP_totalSupply = (await sdk.api.erc20.totalSupply({ target: KLAY_PAIR, block, chain, })).output
  balances[transformAddress(NULL_ADDRESS)] = BigNumber(KLAY_Tokens).multipliedBy(2).multipliedBy(KLAY_LP_Tokens).dividedBy(KLAY_LP_totalSupply).toFixed(0)

  console.log({ USDT_LP_Tokens, USDT_Tokens, USDT_LP_totalSupply, KLAY_LP_Tokens, KLAY_Tokens, KLAY_LP_totalSupply, })
  fixBalances(balances)
  return balances
}

let elkPrice

async function getElkPrice(block) {
  if (elkPrice) return elkPrice
  elkPrice = _getEklUsdtLpPrice(block)
  return elkPrice

  async function _getEklUsdtLpPrice(block) {
    const USDT_Tokens = (await sdk.api.erc20.balanceOf({ target: USDT_TOKEN, owner: USDT_PAIR, block, chain, })).output
    const totalSupply = (await sdk.api.abi.call({ target: USDT_PAIR, abi: 'erc20:totalSupply', block, chain, })).output
    return BigNumber(USDT_Tokens).multipliedBy(2).dividedBy(totalSupply)
  }
}

module.exports = {
  klaytn: {
    tvl,
    staking,
    pool2,
  },
}

