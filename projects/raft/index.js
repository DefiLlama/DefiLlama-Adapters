const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const RAFT_POSITION_MANAGER = '0x5f59b322eb3e16a0c78846195af1f588b77403fc';

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: RAFT_POSITION_MANAGER, tokens: [ADDRESSES.ethereum.WSTETH]}),
  }
}
