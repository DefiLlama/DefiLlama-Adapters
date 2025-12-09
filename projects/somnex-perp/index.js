const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const USDCE = ADDRESSES.somnia.USDC
const USDT = "0x67B302E35Aef5EEE8c32D934F5856869EF428330"

const SPLP = "0x0e7eFB3e546F1D201C01333Ee414FD676ECD8344";
function tvl(api) {
  return sumTokens2({ api, owners: [SPLP], tokens: [USDCE, USDT] })
}

module.exports = {
  somnia: {
    tvl,
  }
}

