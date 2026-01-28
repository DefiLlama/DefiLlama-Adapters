const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
    ethereum: {
        tvl: sumTokensExport({
            tokensAndOwners: [
                [
                    ADDRESSES.ethereum.USDC,
                    '0xdaa289CC487Cf95Ba99Db62f791c7E2d2a4b868E'
                ],
                [
                    ADDRESSES.ethereum.USDT,
                    '0x6925ccD29e3993c82a574CED4372d8737C6dbba6'
                ],
                [
                    ADDRESSES.ethereum.WBTC,
                    '0x2c01390E10e44C968B73A7BcFF7E4b4F50ba76Ed'
                ]
            ]
        })
    },
}