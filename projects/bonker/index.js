const { uniV4HookExport } = require('../helper/uniswapV4')

const BONKER_HOOKS = [
  '0x963E91A45148b39737b9DF10c5b897B55cA9e8cC',
  '0xC9156C1868E122eF5b3e6ed946e1E88ff7da68Cc',
]

const tvl = async (api) => {
  for (const hook of BONKER_HOOKS) {
    await uniV4HookExport({ hook })(api)
  }
}

module.exports = {
  methodology:
    'Counts the value of tokens in Uniswap V4 pools created by Bonker dynamic and static hooks. Bonker LP positions are permanently locked in the Bonker LP locker.',
  start: 1772755200,
  doublecounted: true,
  timetravel: false,
  base: {
    tvl,
  },
}
