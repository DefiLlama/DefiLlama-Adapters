const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api, }, CDP, PSM, USDT, fromBlock) {
  const logs = await getLogs({
    api,
    target: CDP,
    topic: 'AddCollateralType(uint256,address,address,uint256,uint256,uint256,uint256,bool,bool)',
    eventAbi: 'event AddCollateralType(uint256 indexed collateralTypeId, address indexed token, address priceSource, uint256 debtFloor, uint256 debtCeiling, uint256 collateralRatio, uint256 interestRate, bool borrowingEnabled, bool allowlistEnabled)',
    onlyArgs: true,
    fromBlock: fromBlock,
  })

  const ownerTokens = [
    [[USDT], PSM], // psm module
  ]

  ownerTokens.push([logs.map(i => i.token), CDP])

  return sumTokens2({ api, ownerTokens})
}

async function tvlArb(_, _b, _cb, { api, }) {
  return tvl(_, _b, _cb, { api, },
    '0x1cd97ee98f3423222f7b4cddb383f2ee2907e628', '0x0e1Ddf8D61f0570Bf786594077CD431c727335A9',
    ADDRESSES.arbitrum.USDT, 72920436)
}

async function tvlZkevm(_, _b, _cb, { api, }) {
  return tvl(_, _b, _cb, { api, }, '0x36C4E69aacBd10C28beBe4cAd2188f3809CB5226', '0x896cd0b08AdC23cA7F9e5dAaA82ca6e6Ea8576D5',
    '0x1E4a5963aBFD975d8c9021ce480b42188849D41d', 3678493)
}

module.exports = { arbitrum: { tvl: tvlArb }, polygon_zkevm: { tvl: tvlZkevm }}
module.exports.methodology = "Collateral assets in CDP Module and USDT in PSM";

