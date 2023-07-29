const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const owner = "0xc732471083342a842a728221878327c8DeE8aEDB";
const tokens = [
    {symbol: "WKAVA", address: ADDRESSES.kava.WKAVA },
    {symbol: "ETH", address: ADDRESSES.moonriver.USDC },
    {symbol: "USDC", address: ADDRESSES.telos.ETH },
    {symbol: "USDT", address: ADDRESSES.moonriver.USDT },
]

module.exports = {
    kava: {
      tvl: sumTokensExport({ owner, tokens: tokens.map(i => i.address)})
    }
}