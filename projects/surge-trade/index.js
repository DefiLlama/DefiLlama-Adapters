const { sumTokensExport } = require('../helper/chain/radixdlt')

module.exports = {
  radixdlt: { tvl: sumTokensExport({ owner: 'component_rdx1crqujzfeukp9d565sh8usdnjsd8k30saa00h540vnwja7se8qqp8g7'}) },
}