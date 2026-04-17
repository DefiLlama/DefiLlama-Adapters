const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
    bsc: {
        owner: "0x95c2aE48Bd760d330b8D76DbE554F44b0D642021",
    },
    base: {
        owner: "0x8A55a880C8C54952996b28129dDf94919a143A44",
    },
    ethereum: {
        owner: "0xcFFFE014D093d6131A1F1D321C8A1fDcdd92de73",
    },
    polygon: {
        owner: "0xc041F30510a7524541aBF364E104f211ebaD5E8b",
    },
    arbitrum: {
        owner: "0xc041F30510a7524541aBF364E104f211ebaD5E8b",
    },
    optimism: {
        owner: "0x2B343FE5d93B92939Ebf26EDBe7f248f5e029695",
    },
}

Object.keys(config).forEach(chain => {
    const { owner } = config[chain];
    module.exports[chain] = {
    tvl: sumTokensExport({ owner, token: ADDRESSES.null })
  }
})

module.exports.methodology = "TVL is calculated by summing all native token balances in MOKEE vaults across all supported chains."
