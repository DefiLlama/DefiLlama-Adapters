const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  chains: [
    {
       name: 'linea',
       tokens: [
         ADDRESSES.linea.USDT,
         ADDRESSES.linea.USDC,
         ADDRESSES.linea.DAI,
       ],
       holders: [
         '0xBc7f67fA9C72f9fcCf917cBCEe2a50dEb031462A',
       ]
     }
  ]
}