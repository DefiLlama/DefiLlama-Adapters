const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const treasury = "0x257C2039747FBd0217D97335B6269fb1FbFA4C03"; // Treasury
const BLX = "0x220251092F8B63efD0341F69f6ca907Bd6f271Bf"; // BLX
const assets = [nullAddress, ADDRESSES.arbitrum.USDC_CIRCLE] // ETH, USDC

module.exports = {
	start: 194784191,
	arbitrum: {
		tvl: sumTokensExport({ owners: [treasury], tokens: assets }),
		staking: sumTokensExport({ owners: [treasury], tokens: [BLX] }),
	},
}
