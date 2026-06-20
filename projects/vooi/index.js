const ADDRESSES = require('../helper/coreAssets.json')
const config = {
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
};
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'Counts the amount of assets locked in VOOI pools',
  hallmarks: [
    ['2023-08-25',"DWF Labs Depo 1.5m$"]
  ],
};

config.chains.forEach(chainInfo => {
  const {name: chain, tokens, holders} = chainInfo
  module.exports[chain] = {
    tvl: sumTokensExport({ tokens, owners: holders })
  }
})
