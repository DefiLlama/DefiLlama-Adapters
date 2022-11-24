const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getParamCalls, log } = require('../helper/utils')
const { get } = require('../helper/http')
const { PromisePool } = require('@supercharge/promise-pool')

const chain = 'polygon'
const block = undefined
const factory = '0xee13c86ee4eb1ec3a05e2cc3ab70576f31666b3b'
const blacklistedTokens = [
  '0x0b91b07beb67333225a5ba0259d55aee10e3a578', // MNEP
]

async function getTokens(address) {
  return (
    await get(`https://api.covalenthq.com/v1/137/address/${address}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`))
      .data.items.filter(i => +i.balance > 0).map((t) => t.contract_address);
}

async function tvl() {
  const { output: tokenCount } = await sdk.api.abi.call({
    target: factory,
    abi: abis.tokenCounter,
    chain, block,
  })
  let { output: wallets } = await sdk.api.abi.multiCall({
    target: factory,
    abi: abis.walletOf,
    calls: getParamCalls(tokenCount),
    chain, block,
  })
  wallets = wallets.map(i => i.output)
  log(chain, wallets.length)
  const tokensAndOwners = []
  const { errors } = await PromisePool
    .withConcurrency(31)
    .for(wallets)
    .process(addWallet)

  if (errors && errors.length)
    throw errors[0]

  log(chain, 'fetching balances count', tokensAndOwners.length)
  return sumTokens2({ tokensAndOwners, chain, block, blacklistedTokens, });

  async function addWallet(wallet) {
    (await getTokens(wallet)).forEach(i => tokensAndOwners.push([i, wallet]))
  }
}

module.exports = {
  timetravel: false,
  methodology: "The TVL is calculated by summing the value of all assets that are in the wallets deployed by the DeFiBasket contract.",
  polygon: {
    tvl
  },
}

const abis = {
  tokenCounter: {"inputs":[],"name":"tokenCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  walletOf: {"inputs":[{"internalType":"uint256","name":"nftId","type":"uint256"}],"name":"walletOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
}