const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  nos: {
    tvl: sumTokensExport({ owner: '0xea21fbBB923E553d7b98D14106A104665BA57eCd', tokens: [ADDRESSES.nos.BTC] })
  }
}