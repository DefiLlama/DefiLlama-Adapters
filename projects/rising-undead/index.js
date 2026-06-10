const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const owner = "0xc732471083342a842a728221878327c8DeE8aEDB";
const tokens = [
    {symbol: "WKAVA", address: ADDRESSES.kava.WKAVA },
    {symbol: "ETH", address: "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d" },
    {symbol: "USDC", address: "0xfa9343c3897324496a05fc75abed6bac29f8a40f" },
    {symbol: "USDT", address: "0xb44a9b6905af7c801311e8f4e76932ee959c663c" },
]

module.exports = {
    kava: {
      tvl: sumTokensExport({ owner, tokens: tokens.map(i => i.address)})
    }
}