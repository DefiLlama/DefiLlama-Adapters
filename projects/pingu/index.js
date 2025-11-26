const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const fundStore_arb = "0x7Cc41ee3Cba9a1D2C978c37A18A0d6b59c340224"; // fundStore_arb
const PINGU_arb = "0x83E60B9F7f4DB5cDb0877659b1740E73c662c55B"; // PINGU_arb
const assets_ARB = [nullAddress, ADDRESSES.arbitrum.USDC_CIRCLE] // ETH, USDC

const fundStore_monad = "0x576d51fB872065DC4Af6f83902fd4078eBCc2f03"; // fundStore_monad
const PINGU_monad = "0xA2426cD97583939E79Cfc12aC6E9121e37D0904d"; // PINGU_monad
const USDC_monad = ADDRESSES.monad.USDC; // USDC_monad
const assets_MONAD = [nullAddress, USDC_monad] // MON, USDC

module.exports = {
	arbitrum: {
		start: '2024-01-10',
		tvl: sumTokensExport({ owners: [fundStore_arb], tokens: assets_ARB }),
		staking: sumTokensExport({ owners: [fundStore_arb], tokens: [PINGU_arb] }),
	},
	monad: {
		start: '2025-11-24',
		tvl: sumTokensExport({ owners: [fundStore_monad], tokens: assets_MONAD }),
		staking: sumTokensExport({ owners: [fundStore_monad], tokens: [PINGU_monad] }),
	},
}
