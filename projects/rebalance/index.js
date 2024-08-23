const { sumERC4626VaultsExport } = require('../helper/erc4626')
const config = {
  arbitrum: [
    '0x4DdbCB86FCa5B4678Bd132085C818b07cd5716D1', // rUSDT
    '0xD430e22c3a0F8Ebd6813411084a5cb26937f6661', // rUSDC.e
    '0x46cbC1397710e177810B84028F4bf6F8B75B6F71', // rWETH
    '0x52952120EAd486EC7cdd4CA93EA13f2abA44cC20', // rFRAX
    '0xD77B4AdfF67108f7Ea3155ce1fB67c5345ee89C8', // rDAI
  ]
}

module.exports = {
  methodology:
    'TVL displays the total amount of assets stored in the REBALANCE vault contracts.',
  start: 1712143874,
  hallmarks: [[1712143874, 'Profitable vaults deployment']],
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: sumERC4626VaultsExport({ vaults: config[chain], isOG4626: true, }) }
})