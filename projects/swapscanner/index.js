const { sumTokens } = require('../helper/unwrapLPs')
const { getFixBalances } = require('../helper/portedTokens')
const { default: BigNumber } = require('bignumber.js')
const sdk = require('@defillama/sdk')

const chain = 'klaytn'
const stakingAddress = '0x7c59930d1613ca2813e5793da72b324712f6899d'
const token = '0x8888888888885b073f3c81258c27e83db228d5f3'
const LPToken = '0xe1783a85616ad7dbd2b326255d38c568c77ffa26'
const wKLAP = '0xd7a4d10070a4f7bc2a015e78244ea137398c3b74'
const transformedToken = `klaytn:${token}`
const transformedWKLPAToken = `klaytn:${wKLAP}`

async function staking(ts, _block, chainBlocks) {
  const block = chainBlocks[chain]
  const fixBalances = await getFixBalances(chain)
  const { balances, price } = await getTokenPrice(block)
  sdk.util.sumSingleBalance(balances, transformedWKLPAToken, BigNumber(balances[transformedToken]).multipliedBy(price).toFixed(0))
  fixBalances(balances)
  return balances
}

async function pool2(ts, _block, chainBlocks) {
  const block = chainBlocks[chain]
  const fixBalances = await getFixBalances(chain)
  const balances = {}
  await sumTokens(balances, [[token, stakingAddress]], block, chain, undefined, { resolveLP: true })
  const { price } = await getTokenPrice(block)
  sdk.util.sumSingleBalance(balances, transformedWKLPAToken, BigNumber(balances[transformedToken]).multipliedBy(price).toFixed(0))
  fixBalances(balances)
  return balances
}

let priceCache
async function getTokenPrice(block) {
  if (!priceCache) priceCache = _call()
  return priceCache

  async function _call() {
    const balances = {}
    await sumTokens(balances, [[LPToken, stakingAddress]], block, chain, undefined, { resolveLP: true })
    return {
      price: BigNumber(balances[transformedWKLPAToken]).dividedBy(balances[transformedToken]),
      balances
    }
  }
}

module.exports = {
  klaytn: {
    tvl: async () => ({}),
    staking,
    pool2,
  }
}