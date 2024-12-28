const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const { CDP, fromBlock, PSM, USDT } = config[api.chain]
  const logs = await getLogs({
    api,
    target: CDP,
    topic: 'AddCollateralType(uint256,address,address,uint256,uint256,uint256,uint256,bool,bool)',
    eventAbi: 'event AddCollateralType(uint256 indexed collateralTypeId, address indexed token, address priceSource, uint256 debtFloor, uint256 debtCeiling, uint256 collateralRatio, uint256 interestRate, bool borrowingEnabled, bool allowlistEnabled)',
    onlyArgs: true,
    fromBlock,
  })

  const ownerTokens = [
    [[USDT], PSM], // psm module
  ]

  ownerTokens.push([logs.map(i => i.token), CDP])

  return sumTokens2({ api, ownerTokens})
}

module.exports = { arbitrum: { tvl }}
module.exports.methodology = "mooGmxGLP in CDP Module and USDT in PSM";

const config = {
  arbitrum: { CDP: '0x1cd97ee98f3423222f7b4cddb383f2ee2907e628', USDT: ADDRESSES.arbitrum.USDT, fromBlock: 72920436, PSM: '0x0e1Ddf8D61f0570Bf786594077CD431c727335A9'},
  polygon_zkevm: { CDP: '0x36C4E69aacBd10C28beBe4cAd2188f3809CB5226', USDT: ADDRESSES.astarzk.USDT, fromBlock: 3678493, PSM: '0x896cd0b08AdC23cA7F9e5dAaA82ca6e6Ea8576D5'},
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})

