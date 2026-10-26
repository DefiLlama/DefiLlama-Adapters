const { sumTokensExport } = require('../helper/unwrapLPs')

const DEPOSIT_POOL = '0x4D1bE1E2EdB9d6053d6054Ecf343d232B16f146F'
const USDC = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'

module.exports = {
  methodology:
    'TVL is the USDC held in the Vistapex Perps DepositPool contract on Avalanche, where traders deposit their collateral.',
  start: '2026-10-20',
  avax: {
    tvl: sumTokensExport({ owner: DEPOSIT_POOL, tokens: [USDC] }),
  },
}
