const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
    methodology: 'ETH and stETH in vaults',
    ethereum: {
        tvl: sumTokensExport({ owners: [
            "0x325a0e5c84b4d961b19161956f57ae8ba5bb3c26",
        ], tokens: [
            ADDRESSES.ethereum.WETH,
            ADDRESSES.ethereum.STETH
        ]}),
    }
};
