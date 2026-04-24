const { sumTokens2 } = require('../helper/unwrapLPs')

const PRIZE_POOL_PROXY = '0x58fD7df705b5c2e1C05070e0e94f831bb263cDEe'
const HYPE_NATIVE = '0x0000000000000000000000000000000000000000'

async function tvl(api) {
  return sumTokens2({
    owners: [PRIZE_POOL_PROXY],
    tokens: [HYPE_NATIVE],
    api,
  })
}

module.exports = {
  hyperliquid: {
    tvl,
  },
  methodology:
    'TVL counts all HYPE locked in the HypePool prize pool contract on HyperEVM.',
}