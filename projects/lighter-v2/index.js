const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")

const ZK_LIGHTER_CUSTODY = "0x3B4D794a66304F130a4Db8F2551B0070dFCf5ca7"

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owners: [ZK_LIGHTER_CUSTODY],
      tokens: [
        ADDRESSES.ethereum.USDC,
        ADDRESSES.null, // native ETH
      ],
    }),
  },
}

module.exports.methodology =
  "Counts native ETH and ERC-20 tokens held in the canonical ZkLighter core custody contract, where user spot deposits are held on-chain."
