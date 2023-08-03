const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { sumTokensExport } = require('../helper/unwrapLPs')

const contract = "0x638B06F80FB28F109E65C9d5cC585aDf9A0c3f9f"
const usdcToken = ADDRESSES.telos.ETH

module.exports = {
    kava: { tvl: sumTokensExport({ owner: contract, tokens: [usdcToken]}) },
}
