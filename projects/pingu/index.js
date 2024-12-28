const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const fundStore = "0x7Cc41ee3Cba9a1D2C978c37A18A0d6b59c340224"; // FundStore
const PINGU = "0x83E60B9F7f4DB5cDb0877659b1740E73c662c55B"; // PINGU
const assets = [nullAddress, ADDRESSES.arbitrum.USDC_CIRCLE] // ETH, USDC

module.exports = {
	start: '2024-01-10',
	arbitrum: {
		tvl: sumTokensExport({ owners: [fundStore], tokens: assets }),
		staking: sumTokensExport({ owners: [fundStore], tokens: [PINGU] }),
	},
}
