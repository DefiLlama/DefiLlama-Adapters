const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api, }) {
  const CDP = '0x1cd97ee98f3423222f7b4cddb383f2ee2907e628'
  const logs = await getLogs({
    api,
    target: CDP,
    topic: 'AddCollateralType(uint256,address,address,uint256,uint256,uint256,uint256,bool,bool)',
    eventAbi: 'event AddCollateralType(uint256 indexed collateralTypeId, address indexed token, address priceSource, uint256 debtFloor, uint256 debtCeiling, uint256 collateralRatio, uint256 interestRate, bool borrowingEnabled, bool allowlistEnabled)',
    onlyArgs: true,
    fromBlock: 72920436,
  })

  const ownerTokens = [
    [[ADDRESSES.arbitrum.USDT], '0x0e1Ddf8D61f0570Bf786594077CD431c727335A9'], // psm module
  ]

  ownerTokens.push([logs.map(i => i.token), CDP])

  return sumTokens2({ api, ownerTokens})
}

module.exports = { arbitrum: { tvl }}
module.exports.methodology = "mooGmxGLP in CDP Module and USDT in PSM";

