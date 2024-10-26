const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  klaytn: {
    tvl: sumTokensExport({ owners: ['0xeB23e0a5065D96FCa71DE240C6b302B9Da14Ac0e', '0x94b231dD60E64ba8bCC72892cE4B4B9A5004730d'], tokens: [ADDRESSES.klaytn.stKaia] }),
  }
}
