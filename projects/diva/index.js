const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
    methodology: 'ETH and stETH in vaults',
    ethereum: {
        tvl: sumTokensExport({ owners: [
            "0x1ce8aafb51e79f6bdc0ef2ebd6fd34b00620f6db",
            "0x16770d642e882e1769ce4ac8612b8bc0601506fc"
        ], tokens: [
            ADDRESSES.ethereum.WETH,
            ADDRESSES.ethereum.STETH
        ]}),
    }
}; 