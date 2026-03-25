const { nullAddress, treasuryExports } = require('../helper/treasury')
const ADDRESSES = require('../helper/coreAssets.json')

const eco_fund = '0xaeb2a9be7b2429572f6b4baaf3c33d2b0653a45d'
const eco_incentives = '0x772a84869a55d483d507ae238fba4587fc41e674'
const team_allocations = '0x63b514e5ef28cfe16f096de47e6c79ca073ef5fa'
const series_a = '0xeb18e9464516ae2e68202a9cca255a23157bf186'
const sfi_master = '0xdfdca55a5a07e154f18368893692ddd7c0243d4c'
const sfi = '0x7636D8722Fdf7cd34232a915E48e96aA3eB386BF'

module.exports = treasuryExports({
  ethereum: {
    owners: [eco_fund, eco_incentives, team_allocations, series_a, sfi_master],
    ownTokens: [sfi],
  },
})