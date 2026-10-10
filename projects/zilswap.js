const BigNumber = require('bignumber.js')
const { call, formQuery } = require('./helper/chain/zilliqa')

// https://github.com/Switcheo/zilswap#deployed-contracts
const CONTRACT = '459cb2d3baf7e61cfbd5fe362f289ae92b2babb0'

async function tvl() {
  const { result, error } = await call(formQuery({ params: [CONTRACT, 'pools', []] }))
  if (error) throw new Error(`ZilSwap RPC error: ${error.message}`)

  const pools = result?.pools
  if (!pools || typeof pools !== 'object' || Array.isArray(pools))
    throw new Error('Invalid ZilSwap pools response')

  const zilReserve = Object.values(pools).reduce((total, pool) => total + getZilReserve(pool), 0n)
  // Each Pool contains [ZIL reserve, token reserve]. Value the token side at
  // the pool's reserve ratio, so both sides together are worth twice its ZIL.
  // CoinGecko balances must be numbers in the SDK; convert only after summing Qa.
  return {
    'coingecko:zilliqa': BigNumber(zilReserve.toString()).times(2).shiftedBy(-12).toNumber(),
  }
}

function getZilReserve(pool) {
  const reserves = pool?.arguments
  if (!Array.isArray(reserves) || reserves.length !== 2 || !reserves.every(isReserve))
    throw new Error('Invalid ZilSwap pool reserves')

  const [zilReserve, tokenReserve] = reserves.map(BigInt)
  if ((zilReserve === 0n) !== (tokenReserve === 0n))
    throw new Error('Invalid ZilSwap pool: one-sided reserves')

  return zilReserve
}

function isReserve(value) {
  return typeof value === 'string' && /^\d+$/.test(value)
}

module.exports = {
  zilliqa: {
    tvl,
  },
  methodology: 'Reads recorded reserves from all pools in the current ZilSwap contract on Zilliqa. Values paired ZRC-2 reserves at each pool\'s reserve ratio (twice the native ZIL reserve), without reconciling token-contract balances. Excludes LP shares, rewards and the migrated legacy contract.',
  misrepresentedTokens: true,
  timetravel: false,
}
