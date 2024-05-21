const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const tokens = {
  USDT: ADDRESSES.bsc.USDT,
  WBNB: ADDRESSES.bsc.WBNB,
  BTC: ADDRESSES.bsc.BTCB,
  ETH: ADDRESSES.bsc.ETH,
  SOL: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
}
const POOL = '0xF86f70fb4959a9FCF1e7dD67A05dC0AC95c3802d'

module.exports = {
  bsc: {
    tvl: sumTokensExport({ owner: POOL, tokens: Object.values(tokens), })
  },
  hallmarks: [
    [Math.floor(new Date('2024-02-26') / 1e3), 'Max leverage increase to 100x'],
    [Math.floor(new Date('2024-03-05') / 1e3), 'Solana integration'],
  ],
}