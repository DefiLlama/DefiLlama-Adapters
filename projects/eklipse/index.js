const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')
const { getChainTransform, } = require('../helper/portedTokens')
const { toUSDTBalances } = require('../helper/balances')
const { sumTokens } = require('../helper/unwrapLPs')
const vaults = require('./vaults')
const chain = 'klaytn'
const EKL_TOKEN = '0x807c4e063eb0ac21e8eef7623a6ed50a8ede58ca'
const STAKING_ADDRESS = '0xD067C3b871ee9E07BA4205A8F96c182baBBA6c58'
const USDT_TOKEN = ADDRESSES.klaytn.oUSDT
const POOL2_ADDRESS = '0x625ae9043e8730c4a1e30b36838502fb90e1d3c2'
const USDT_PAIR = '0x219ee5d76593f5bd639125b6411a17d309e3ad31'
const KLAY_PAIR = '0x5db231ac93faaad876155dc0853bb11a2f4b0fb2'
const W_KLAY_ADDRESS = '0xd7a4d10070a4f7bc2a015e78244ea137398c3b74'

const TOKENS = {
  kDAI: {
    address: ADDRESSES.klaytn.KDAI,
    decimal: 18
  },
  kBUSD: {
    address: ADDRESSES.klaytn.oBUSD,
    decimal: 18
  },
  kUSDC: {
    decimal: 6,
    address: ADDRESSES.klaytn.oUSDC
  },
  KSD: {
    address: ADDRESSES.klaytn.KSD,
    decimal: 18
  },
  KASH: {
    address: ADDRESSES.klaytn.KASH,
    decimal: 18
  },
  EKL: {
    decimal: 18,
    address: '0x807c4e063eb0ac21e8eef7623a6ed50a8ede58ca'
  },
  kUSDT: {
    decimal: 6,
    address: ADDRESSES.klaytn.oUSDT
  },
  pUSD: {
    decimal: 18,
    address: ADDRESSES.klaytn.pUSD
  },
  USDK: {
    decimal: 18,
    address: ADDRESSES.klaytn.USDK
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
  return {
    [ADDRESSES.klaytn.USDT]: BigNumber(value).times(1e-12).toFixed(0),
  }
}


async function pool2(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks[chain]
  const transformAddress = await getChainTransform(chain)
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
  balances[transformAddress(W_KLAY_ADDRESS)] = BigNumber(KLAY_Tokens).multipliedBy(2).multipliedBy(KLAY_LP_Tokens).dividedBy(KLAY_LP_totalSupply).toFixed(0)

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

