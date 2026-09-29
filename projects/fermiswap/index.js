const ADDRESSES = require('../helper/coreAssets.json')

const SWAPPER = '0xb1076fE3AB5e28005C7c323Bac5AC06a680d452e'
const TOKENS = [
  ADDRESSES.ethereum.WETH,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.cbBTC,
  ADDRESSES.ethereum.WBTC,
]

async function tvl(api) {
  const owner = await api.call({
    target: SWAPPER,
    abi: 'address:traderVault',
  })

  return api.sumTokens({ owner, tokens: TOKENS })
}

module.exports = {
  methodology:
    "TVL is the value of WETH, USDT, USDC, cbBTC, and WBTC held in FermiSwap's inventory vault.",
  start: '2026-05-12',
  ethereum: { tvl },
}
