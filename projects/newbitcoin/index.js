const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { uniV3Export } = require('../helper/uniswapV3')

let alphaCoins = uniV3Export({
  nos: { factory: '0x1d12AC81710da54A50e2e9095E20dB2D915Ce3C8', fromBlock: 320282, },
})

let alphaKeys = {
  tvl: sumTokensExport({ owner: '0xea21fbBB923E553d7b98D14106A104665BA57eCd', tokens: [ADDRESSES.nos.BTC] })
}

module.exports = {
  nos: { tvl: BigInt(alphaKeys.tvl) + BigInt(alphaCoins) },
}