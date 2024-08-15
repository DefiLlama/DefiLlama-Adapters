const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const treasury = "0x82cf20d2dba8613F75E2DAc69eff9040bcEe88d3"; // Treasury
const BLX = "0x220251092F8B63efD0341F69f6ca907Bd6f271Bf"; // BLX
const assets = [nullAddress, ADDRESSES.arbitrum.USDC_CIRCLE] // ETH, USDC

module.exports = {
	start: 237562710,
	arbitrum: {
		tvl: sumTokensExport({ owners: [treasury], tokens: assets }),
		staking: sumTokensExport({ owners: [treasury], tokens: [BLX] }),
	},
}
