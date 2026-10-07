const { addUniV4PoolReserves } = require('../helper/uniswapV4')

const STATICS = '0x2d8d6F4A93AcD7a916A5a654ec8b690bA3B3EAdd'
const WETH = '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73'
const GENESIS_VAULT = '0x8AAAF9a22f439589987B8f1e69d79ca4f648C297'
const STATE_VIEW = '0xF3334192D15450CdD385c8B70E03f9a6Bd9E673b'

const CANONICAL_POOL = {
  id: '0xe79228d6cae086a58bf5b22220b454e5d1ca4f13da767ea5bbe032d5a1e82e8a',
  token0: WETH,
  token1: STATICS,
  spacing: 100,
}

async function tvl(api) {
  const reserveETH = await api.call({ target: GENESIS_VAULT, abi: 'uint256:reserveETH' })

  await addUniV4PoolReserves({ api, pools: [CANONICAL_POOL], stateView: STATE_VIEW })
  api.removeTokenBalance(STATICS)
  api.addGasToken(reserveETH)
}

module.exports = {
  methodology: 'TVL is the WETH side of the permanent canonical STATICS/WETH Uniswap v4 market plus the native ETH reserve backing circulating Statics Operators. The STATICS side of the market and STATICS Operator backing are excluded as protocol-owned token value. The pool liquidity is also counted by the Uniswap v4 adapter.',
  doublecounted: true,
  start: 1787875200,
  robinhood: { tvl },
}
