const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const fundStore = "0x7Cc41ee3Cba9a1D2C978c37A18A0d6b59c340224"; // FundStore
const PINGU = "0x4615fa30fFA5716984d4372030ce28D99fCB702f"; // PINGU
const assets = [nullAddress, ADDRESSES.arbitrum.USDC_CIRCLE] // ETH, USDC

module.exports = {
	start: 1704844800,
	arbitrum: {
		tvl: sumTokensExport({ owners: [fundStore], tokens: assets }),
		staking: sumTokensExport({ owners: [fundStore], tokens: [PINGU] }),
	},
}
