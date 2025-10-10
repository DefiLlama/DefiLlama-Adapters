const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const fundStore = "0xb7884D6bc7361EcbacAfAbBd949DE7D47B2a0e27"; // FundStore
const SPACEWHALE = "0xf5961a2441fC68E38300cd8ae8d6a172b12D7E7A"; // SPACEWHALE
const assets = [nullAddress, ADDRESSES.arbitrum.USDC_CIRCLE] // ETH, USDC

module.exports = {
	start: '2024-04-03',
	arbitrum: {
		tvl: sumTokensExport({ owners: [fundStore], tokens: assets }),
		staking: sumTokensExport({ owners: [fundStore], tokens: [SPACEWHALE] }),
	},
}